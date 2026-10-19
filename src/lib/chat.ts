/**
 * Shared by the chat widget (browser) and the chat API (AWS Lambda in chat-api/).
 * The browser never sees the Anthropic key: it only talks to the chat API.
 */

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export const CHAT_LIMITS = {
  /** longest question a visitor can send */
  maxMessageChars: 600,
  /** how many earlier messages travel with each question */
  maxHistory: 10,
  /** longest bot answer accepted back as history */
  maxAssistantChars: 2000,
  /** per visitor IP address */
  perHour: 10,
  perDay: 30,
} as const;

export interface ChatReply {
  reply?: string;
  error?: string;
}

/**
 * Checks a request body and returns the messages, or an error string.
 * The history must start with the visitor and end with the visitor's new question.
 */
export function parseChatBody(body: unknown): ChatMessage[] | string {
  if (!body || typeof body !== "object") return "invalid request";
  const { messages, website } = body as { messages?: unknown; website?: unknown };
  // Hidden form field that people never fill in; simple bots do.
  if (typeof website === "string" && website.length > 0) return "invalid request";
  if (!Array.isArray(messages) || messages.length === 0) return "no messages";
  if (messages.length > CHAT_LIMITS.maxHistory + 1) return "too many messages";

  const out: ChatMessage[] = [];
  for (const m of messages) {
    if (!m || typeof m !== "object") return "invalid message";
    const { role, content } = m as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") return "invalid role";
    if (typeof content !== "string" || !content.trim()) return "empty message";
    const max = role === "user" ? CHAT_LIMITS.maxMessageChars : CHAT_LIMITS.maxAssistantChars;
    if (content.length > max) return "message too long";
    out.push({ role, content: content.trim() });
  }
  if (out[0].role !== "user" || out.at(-1)?.role !== "user") return "invalid order";
  return out;
}

/** Keeps the last few messages, starting with a visitor message. */
export function trimHistory(messages: ChatMessage[]): ChatMessage[] {
  const recent = messages.slice(-(CHAT_LIMITS.maxHistory + 1));
  const firstUser = recent.findIndex((m) => m.role === "user");
  return firstUser === -1 ? [] : recent.slice(firstUser);
}
