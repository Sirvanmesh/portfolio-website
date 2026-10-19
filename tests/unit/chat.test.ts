import { describe, expect, it, vi } from "vitest";
import { CHAT_LIMITS, parseChatBody, trimHistory, type ChatMessage } from "@/lib/chat";
import { createChatHandler, createMemoryCounter, visitorKey } from "../../chat-api/src/core";
import { buildSystemPrompt } from "../../chat-api/src/prompt";
import { profile, projects } from "@/content/profile";

const ORIGIN = "https://site.example";
const ask = (text: string): ChatMessage[] => [{ role: "user", content: text }];

function setup(reply: string | null = "He builds data tools.") {
  const askFn = vi.fn(async () => reply);
  const handle = createChatHandler({
    allowedOrigins: [ORIGIN],
    count: createMemoryCounter(),
    ask: askFn,
    now: () => 1_700_000_000_000,
  });
  const post = (body: unknown, ip = "1.2.3.4", origin = ORIGIN) =>
    handle({ method: "POST", origin, ip, body: JSON.stringify(body) });
  return { handle, post, askFn };
}

describe("parseChatBody", () => {
  it("accepts a simple question", () => {
    expect(parseChatBody({ messages: ask("hi") })).toEqual(ask("hi"));
  });

  it("rejects bad shapes", () => {
    expect(parseChatBody(null)).toBeTypeOf("string");
    expect(parseChatBody({ messages: [] })).toBeTypeOf("string");
    expect(parseChatBody({ messages: [{ role: "system", content: "x" }] })).toBeTypeOf("string");
    expect(parseChatBody({ messages: [{ role: "user", content: "   " }] })).toBeTypeOf("string");
  });

  it("rejects history that does not start and end with the visitor", () => {
    const msgs = [
      { role: "assistant", content: "hi" },
      { role: "user", content: "q" },
    ];
    expect(parseChatBody({ messages: msgs })).toBe("invalid order");
    expect(parseChatBody({ messages: [...ask("q"), { role: "assistant", content: "a" }] })).toBe(
      "invalid order",
    );
  });

  it("rejects long questions and long histories", () => {
    const long = "x".repeat(CHAT_LIMITS.maxMessageChars + 1);
    expect(parseChatBody({ messages: ask(long) })).toBe("message too long");
    const many = Array.from({ length: CHAT_LIMITS.maxHistory + 3 }, () => ask("q")[0]);
    expect(parseChatBody({ messages: many })).toBe("too many messages");
  });

  it("rejects bots that fill the hidden field", () => {
    expect(parseChatBody({ messages: ask("hi"), website: "spam.example" })).toBe("invalid request");
  });
});

describe("trimHistory", () => {
  it("keeps the newest messages and starts with the visitor", () => {
    const msgs: ChatMessage[] = Array.from({ length: 30 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: String(i),
    }));
    msgs.push({ role: "user", content: "last" });
    const out = trimHistory(msgs);
    expect(out.length).toBeLessThanOrEqual(CHAT_LIMITS.maxHistory + 1);
    expect(out[0].role).toBe("user");
    expect(out.at(-1)?.content).toBe("last");
    expect(parseChatBody({ messages: out })).toEqual(out);
  });
});

describe("chat handler", () => {
  it("answers a valid question", async () => {
    const { post, askFn } = setup();
    const res = await post({ messages: ask("what does he do?") });
    expect(res).toEqual({ status: 200, body: { reply: "He builds data tools." } });
    expect(askFn).toHaveBeenCalledOnce();
  });

  it("blocks other websites and other methods", async () => {
    const { handle, post, askFn } = setup();
    expect((await post({ messages: ask("hi") }, "1.2.3.4", "https://evil.example")).status).toBe(
      403,
    );
    expect((await handle({ method: "GET", origin: ORIGIN, ip: "1.2.3.4" })).status).toBe(405);
    expect(askFn).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON without calling Claude", async () => {
    const { handle, askFn } = setup();
    const res = await handle({ method: "POST", origin: ORIGIN, ip: "1.2.3.4", body: "{oops" });
    expect(res.status).toBe(400);
    expect(askFn).not.toHaveBeenCalled();
  });

  it("limits each visitor per hour, with contact details in the message", async () => {
    const { post, askFn } = setup();
    for (let i = 0; i < CHAT_LIMITS.perHour; i++) {
      expect((await post({ messages: ask("q") })).status).toBe(200);
    }
    const blocked = await post({ messages: ask("q") });
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toContain(profile.email);
    expect(askFn).toHaveBeenCalledTimes(CHAT_LIMITS.perHour);
    // Another visitor is not affected.
    expect((await post({ messages: ask("q") }, "5.6.7.8")).status).toBe(200);
  });

  it("gives contact details when Claude declines", async () => {
    const { post } = setup(null);
    const res = await post({ messages: ask("hi") });
    expect(res.status).toBe(200);
    expect(res.body.reply).toContain(profile.email);
  });

  it("hides internal errors", async () => {
    const handle = createChatHandler({
      allowedOrigins: [ORIGIN],
      count: createMemoryCounter(),
      ask: async () => {
        throw new Error("secret detail");
      },
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await handle({
      method: "POST",
      origin: ORIGIN,
      ip: "1.2.3.4",
      body: JSON.stringify({ messages: ask("hi") }),
    });
    expect(res.status).toBe(502);
    expect(JSON.stringify(res.body)).not.toContain("secret detail");
  });

  it("never stores raw IP addresses", () => {
    const key = visitorKey("203.0.113.9");
    expect(key).not.toContain("203.0.113.9");
    expect(key).toBe(visitorKey("203.0.113.9"));
  });
});

describe("system prompt", () => {
  const prompt = buildSystemPrompt();

  it("contains the profile, projects and contact details", () => {
    expect(prompt).toContain(profile.name);
    expect(prompt).toContain(profile.email);
    expect(prompt).toContain(profile.linkedin);
    for (const p of projects) expect(prompt).toContain(p.name);
  });

  it("never mentions private work systems", () => {
    const lower = prompt.toLowerCase();
    for (const word of ["landrite", "laser schema", "land system"]) {
      expect(lower).not.toContain(word);
    }
  });
});
