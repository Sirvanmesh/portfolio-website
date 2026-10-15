"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { runCommand, type OutputLine } from "@/lib/terminal";
import { profile } from "@/content/profile";

interface Entry {
  id: number;
  command?: string;
  lines: OutputLine[];
}

const WELCOME: OutputLine[] = [
  { text: `welcome to ${profile.handle}'s terminal.`, kind: "accent" },
  {
    text: "type 'ls' to see the pages, 'cd projects' to open one, or 'help' for more.",
    kind: "muted",
  },
  { text: "no keyboard? tap a command below.", kind: "muted" },
];

const QUICK = ["ls", "whoami", "skills", "projects", "cd about", "help"];

export default function Terminal() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([{ id: 0, lines: WELCOME }]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  function execute(command: string) {
    const result = runCommand(command);
    if (result.action?.type === "clear") {
      setEntries([]);
    } else {
      setEntries((prev) => [...prev, { id: nextId.current++, command, lines: result.lines }]);
    }
    if (result.action?.type === "open") {
      const url = result.action.url;
      if (url.startsWith("mailto:")) window.location.href = url;
      else window.open(url, "_blank", "noopener,noreferrer");
    }
    if (result.action?.type === "navigate") {
      const path = result.action.path;
      // A short pause so the "opening…" line is seen before the page changes.
      window.setTimeout(() => router.push(path), 350);
    }
    if (command.trim()) setHistory((h) => [...h, command]);
    setHistoryIndex(null);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    execute(value);
    setValue("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp" && history.length) {
      e.preventDefault();
      const i = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(i);
      setValue(history[i]);
    } else if (e.key === "ArrowDown" && historyIndex !== null) {
      e.preventDefault();
      const i = historyIndex + 1;
      if (i >= history.length) {
        setHistoryIndex(null);
        setValue("");
      } else {
        setHistoryIndex(i);
        setValue(history[i]);
      }
    }
  }

  return (
    <div className="window term" data-testid="terminal">
      <div className="window-bar">
        <span aria-hidden="true" className="dot dot-red" />
        <span aria-hidden="true" className="dot dot-amber" />
        <span aria-hidden="true" className="dot dot-green" />
        <span className="window-title">{profile.handle}@calgary: ~</span>
      </div>
      <div
        className="term-output"
        ref={outputRef}
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
        data-testid="terminal-output"
        onClick={() => inputRef.current?.focus()}
      >
        {entries.map((entry) => (
          <div key={entry.id}>
            {entry.command !== undefined && (
              <span className="term-line">
                <span className="prompt-sign">$</span>{" "}
                <span className="term-echo">{entry.command}</span>
              </span>
            )}
            {entry.lines.map((line, i) => {
              const className = `term-line term-line-${line.kind ?? "default"}`;
              if (!line.href)
                return (
                  <span key={i} className={className}>
                    {line.text}
                  </span>
                );
              if (line.href.startsWith("/"))
                return (
                  <Link key={i} className={className} href={line.href}>
                    {line.text}
                  </Link>
                );
              return (
                <a
                  key={i}
                  className={className}
                  href={line.href}
                  target={line.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                >
                  {line.text}
                </a>
              );
            })}
          </div>
        ))}
      </div>
      <form className="term-form" onSubmit={onSubmit}>
        <label htmlFor="term-input">{profile.handle}@portfolio:~$</label>
        <input
          id="term-input"
          ref={inputRef}
          className="term-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="send"
          placeholder="type ls"
          aria-describedby="term-hint"
        />
      </form>
      <p id="term-hint" className="sr-only">
        Type a command such as ls, cd projects, skills or help, then press Enter. Use the up and
        down arrows for history.
      </p>
      <div className="term-chips" aria-label="Quick commands">
        {QUICK.map((c) => (
          <button key={c} type="button" className="chip" onClick={() => execute(c)}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
