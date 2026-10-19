"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { profile } from "@/content/profile";
import { CHAT_LIMITS, trimHistory, type ChatMessage, type ChatReply } from "@/lib/chat";

interface Entry {
  id: number;
  from: "you" | "bot" | "sys";
  text: string;
}

const GREETING = `hi, i'm ${profile.handle}'s portfolio bot. ask me about his skills, projects, experience, or how to reach him.`;
const SUGGESTIONS = [
  "what does he do?",
  "top skills?",
  "show me his AI projects",
  "how do I contact him?",
];

// Local dev: NEXT_PUBLIC_CHAT_API_URL in .env.local. Deployed: /chat-config.json, written by the deploy job.
let apiUrlPromise: Promise<string | null> | undefined;
function getApiUrl(): Promise<string | null> {
  apiUrlPromise ??= (async () => {
    // Dev only, so a local .env.local never leaks into a production build.
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_CHAT_API_URL) {
      return process.env.NEXT_PUBLIC_CHAT_API_URL;
    }
    try {
      const res = await fetch("/chat-config.json", { cache: "no-store" });
      if (!res.ok) return null;
      const { url } = (await res.json()) as { url?: string };
      return url || null;
    } catch {
      return null;
    }
  })();
  return apiUrlPromise;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// The invitation pops up once per browser tab session, not on every page.
const TEASER_KEY = "chat-teaser-seen";
const TEASER_DELAY_MS = 1200;
const BOOT_LINES = [
  "booting mohammad.ai",
  "loading profile.ts",
  "model claude-haiku linked",
  "scope locked: mohammad only",
];

function teaserSeen() {
  try {
    return sessionStorage.getItem(TEASER_KEY) === "1";
  } catch {
    return false;
  }
}

function markTeaserSeen() {
  try {
    sessionStorage.setItem(TEASER_KEY, "1");
  } catch {
    // Private mode or blocked storage: the invitation may show again, which is fine.
  }
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([{ id: 0, from: "bot", text: GREETING }]);
  const [typing, setTyping] = useState<{ id: number; shown: number } | null>(null);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [teaser, setTeaser] = useState(false);
  const [bootStep, setBootStep] = useState(0);
  const nextId = useRef(1);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries, typing, busy]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Shows the invitation shortly after the first page load, then runs the boot lines.
  useEffect(() => {
    if (teaserSeen()) return;
    const t = window.setTimeout(() => {
      setTeaser(true);
      setBootStep(prefersReducedMotion() ? BOOT_LINES.length : 0);
    }, TEASER_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!teaser || bootStep >= BOOT_LINES.length) return;
    const t = window.setTimeout(() => setBootStep((s) => s + 1), 380);
    return () => window.clearTimeout(t);
  }, [teaser, bootStep]);

  function dismissTeaser() {
    setTeaser(false);
    markTeaserSeen();
  }

  function openChat() {
    dismissTeaser();
    setOpen(true);
  }

  // Types the newest bot answer out like a terminal.
  useEffect(() => {
    if (!typing) return;
    const entry = entries.find((e) => e.id === typing.id);
    if (!entry || typing.shown >= entry.text.length) {
      setTyping(null);
      return;
    }
    const t = window.setTimeout(() => setTyping({ id: typing.id, shown: typing.shown + 3 }), 12);
    return () => window.clearTimeout(t);
  }, [typing, entries]);

  function add(from: Entry["from"], text: string) {
    const id = nextId.current++;
    setEntries((prev) => [...prev, { id, from, text }]);
    if (from === "bot" && !prefersReducedMotion()) setTyping({ id, shown: 0 });
  }

  function close() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  async function ask(question: string) {
    const text = question.trim().slice(0, CHAT_LIMITS.maxMessageChars);
    if (!text || busy) return;
    setValue("");
    add("you", text);
    setBusy(true);

    const history: ChatMessage[] = trimHistory([
      ...entries
        .filter((e) => e.id !== 0 && e.from !== "sys")
        .map((e): ChatMessage => ({
          role: e.from === "you" ? "user" : "assistant",
          content: e.text,
        })),
      { role: "user", content: text },
    ]);

    try {
      const url = await getApiUrl();
      if (!url) {
        add("sys", `chat is offline. email ${profile.email} or find him on LinkedIn.`);
        return;
      }
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history, website: honeypot }),
      });
      const data = (await res.json().catch(() => ({}))) as ChatReply;
      if (res.ok && data.reply) add("bot", data.reply);
      else add("sys", data.error ?? `something went wrong. email ${profile.email}.`);
    } catch {
      add("sys", `network error. email ${profile.email} instead.`);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void ask(value);
  }

  const asked = entries.some((e) => e.from === "you");

  return (
    <div className="chat" data-open={open}>
      {open && (
        <section
          id="chat-panel"
          className="chat-panel window"
          role="dialog"
          aria-label="Chat with Mohammad's portfolio bot"
          onKeyDown={(e) => e.key === "Escape" && close()}
          data-testid="chat-panel"
        >
          <div className="window-bar chat-bar">
            <span aria-hidden="true" className="dot dot-red" />
            <span aria-hidden="true" className="dot dot-amber" />
            <span aria-hidden="true" className="dot dot-green" />
            <span className="window-title">{profile.handle}-bot@portfolio: ~/chat</span>
            <button type="button" className="chat-close" onClick={close} aria-label="Close chat">
              ×
            </button>
          </div>

          <div className="chat-status" aria-hidden="true">
            <span>
              <span className="chat-led" /> online
            </span>
            <span>model: claude-haiku</span>
            <span>scope: {profile.handle} only</span>
          </div>

          <div
            className="chat-log"
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
            data-testid="chat-log"
          >
            {entries.map((e) => {
              const isTyping = typing?.id === e.id;
              return (
                <p key={e.id} className={`chat-line chat-${e.from}`}>
                  <span className="chat-who">
                    {e.from === "you" ? "you>" : e.from === "bot" ? "bot>" : "sys>"}
                  </span>{" "}
                  {isTyping ? (
                    <>
                      <span aria-hidden="true">{e.text.slice(0, typing.shown)}</span>
                      <span className="sr-only">{e.text}</span>
                    </>
                  ) : (
                    e.text
                  )}
                </p>
              );
            })}
            {busy && (
              <p className="chat-line chat-sys">
                <span className="chat-who">bot&gt;</span> <span className="chat-spinner" /> thinking
              </p>
            )}
          </div>

          {!asked && (
            <div className="chat-suggest" aria-label="Suggested questions">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="chip" onClick={() => void ask(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <form className="chat-form" onSubmit={onSubmit}>
            <label htmlFor="chat-input" className="prompt-sign">
              &gt;
            </label>
            <input
              id="chat-input"
              ref={inputRef}
              className="term-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={CHAT_LIMITS.maxMessageChars}
              placeholder="ask about mohammad…"
              autoComplete="off"
              enterKeyHint="send"
              aria-label="Your question"
              disabled={busy}
            />
            <input
              className="chat-hp"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary chat-send"
              disabled={busy || !value.trim()}
            >
              send
            </button>
          </form>

          <div className="chat-contact">
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              linkedin ↗
            </a>
          </div>
        </section>
      )}

      {teaser && !open && (
        <aside className="chat-teaser" aria-label="Chat invitation" data-testid="chat-teaser">
          <div className="chat-teaser-glow" aria-hidden="true" />
          <div className="chat-teaser-head">
            <span className="chat-teaser-tag">
              <span className="chat-led" aria-hidden="true" /> mohammad.ai
            </span>
            <span className="chat-teaser-ver" aria-hidden="true">
              v1.0 // live
            </span>
            <button
              type="button"
              className="chat-close"
              onClick={dismissTeaser}
              aria-label="Dismiss chat invitation"
            >
              ×
            </button>
          </div>
          <ol className="chat-boot" aria-hidden="true">
            {BOOT_LINES.slice(0, bootStep).map((line) => (
              <li key={line}>
                <span className="chat-boot-ok">[ ok ]</span> {line}
              </li>
            ))}
            {bootStep < BOOT_LINES.length && (
              <li>
                <span className="chat-spinner" /> …
              </li>
            )}
          </ol>
          {bootStep >= BOOT_LINES.length && (
            <div className="chat-teaser-body">
              <p className="chat-teaser-title" data-text="Got questions? Ask my AI.">
                Got questions? Ask my AI.
              </p>
              <p className="chat-teaser-sub">
                Skills, projects, experience or how to reach me. Instant answers.
              </p>
              <button type="button" className="btn btn-primary chat-teaser-cta" onClick={openChat}>
                <span aria-hidden="true">▶</span> start chat
              </button>
            </div>
          )}
        </aside>
      )}

      <button
        ref={launcherRef}
        type="button"
        className={`chat-launcher${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-controls="chat-panel"
        onClick={() => (open ? close() : openChat())}
      >
        <span className="chat-launcher-icon" aria-hidden="true">
          {open ? "×" : ">_"}
        </span>
        <span className="chat-launcher-text">
          <span className="chat-launcher-label">{open ? "close chat" : "ask_mohammad.ai"}</span>
          {!open && (
            <span className="chat-launcher-sub">
              <span className="chat-led" aria-hidden="true" /> AI assistant · online
            </span>
          )}
        </span>
      </button>
    </div>
  );
}
