import { createHash } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { CHAT_LIMITS, parseChatBody, type ChatMessage, type ChatReply } from "@/lib/chat";
import { profile } from "@/content/profile";
import { buildSystemPrompt } from "./prompt";

export const MODEL = "claude-haiku-5-5";

export interface ChatRequest {
  method: string;
  origin?: string;
  ip: string;
  body?: string;
}

export interface ChatResponse {
  status: number;
  body: ChatReply;
}

export interface Window {
  name: "hour" | "day";
  seconds: number;
  limit: number;
}

export const WINDOWS: Window[] = [
  { name: "hour", seconds: 3600, limit: CHAT_LIMITS.perHour },
  { name: "day", seconds: 86400, limit: CHAT_LIMITS.perDay },
];

/** Adds one to the visitor's counter for a window. Returns false when the limit is reached. */
export type CountFn = (key: string, window: Window, nowSeconds: number) => Promise<boolean>;

export type AskFn = (messages: ChatMessage[]) => Promise<string | null>;

export interface ChatDeps {
  allowedOrigins: string[];
  count: CountFn;
  ask: AskFn;
  now?: () => number;
}

const CONTACT = `You can reach Mohammad at ${profile.email} or on LinkedIn: ${profile.linkedin}`;

/** IP addresses are hashed so the rate-limit table never stores them. */
export function visitorKey(ip: string): string {
  return createHash("sha256").update(`portfolio-chat:${ip}`).digest("hex").slice(0, 32);
}

export function createChatHandler(deps: ChatDeps) {
  return async function handle(req: ChatRequest): Promise<ChatResponse> {
    if (req.method !== "POST") return { status: 405, body: { error: "method not allowed" } };
    if (!req.origin || !deps.allowedOrigins.includes(req.origin)) {
      return { status: 403, body: { error: "origin not allowed" } };
    }

    let json: unknown;
    try {
      json = JSON.parse(req.body ?? "");
    } catch {
      return { status: 400, body: { error: "invalid json" } };
    }
    const messages = parseChatBody(json);
    if (typeof messages === "string") return { status: 400, body: { error: messages } };

    const now = Math.floor((deps.now ?? Date.now)() / 1000);
    const key = visitorKey(req.ip);
    for (const window of WINDOWS) {
      if (!(await deps.count(key, window, now))) {
        return {
          status: 429,
          body: {
            error: `rate limit: ${window.limit} questions per ${window.name}. ${CONTACT}`,
          },
        };
      }
    }

    try {
      const reply = await deps.ask(messages);
      if (!reply) return { status: 200, body: { reply: `I can't help with that. ${CONTACT}` } };
      return { status: 200, body: { reply } };
    } catch (err) {
      console.error("chat failed", err instanceof Error ? err.message : err);
      if (err instanceof Anthropic.RateLimitError) {
        return { status: 503, body: { error: `the bot is busy, try again soon. ${CONTACT}` } };
      }
      return { status: 502, body: { error: `the bot is offline right now. ${CONTACT}` } };
    }
  };
}

/** Calls Claude with the portfolio-only system prompt. Returns null when Claude declines. */
export function createAsk(apiKey: string): AskFn {
  const client = new Anthropic({ apiKey, maxRetries: 1, timeout: 20_000 });
  const system = buildSystemPrompt();

  return async (messages) => {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      output_config: { effort: "low" },
      system,
      messages,
    });
    if (response.stop_reason === "refusal") return null;
    const text = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();
    return text || null;
  };
}

/** In-memory counter for local development and tests. */
export function createMemoryCounter(): CountFn {
  const counts = new Map<string, number>();
  return async (key, window, now) => {
    const id = `${key}#${window.name}#${Math.floor(now / window.seconds)}`;
    const n = counts.get(id) ?? 0;
    if (n >= window.limit) return false;
    counts.set(id, n + 1);
    return true;
  };
}
