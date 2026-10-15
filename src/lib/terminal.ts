import { aiToolkit, certificates, experience, profile, projects, skills } from "@/content/profile";

export type LineKind = "default" | "muted" | "accent" | "warn" | "error";

export interface OutputLine {
  text: string;
  kind?: LineKind;
  href?: string;
}

export type TerminalAction = { type: "clear" } | { type: "open"; url: string };

export interface CommandResult {
  lines: OutputLine[];
  action?: TerminalAction;
}

export const COMMANDS: { name: string; help: string }[] = [
  { name: "help", help: "list commands" },
  { name: "whoami", help: "who I am" },
  { name: "about", help: "a little about me" },
  { name: "skills", help: "what I work with" },
  { name: "ai", help: "the AI techniques I use" },
  { name: "projects", help: "things I've built (also: ls)" },
  { name: "experience", help: "where I work" },
  { name: "certs", help: "certificates" },
  { name: "contact", help: "how to reach me" },
  { name: "linkedin", help: "open my LinkedIn" },
  { name: "email", help: "write me an email" },
  { name: "clear", help: "clear the screen" },
];

const pad = (s: string, n: number) => (s.length >= n ? s + " " : s + " ".repeat(n - s.length));

export function runCommand(rawInput: string): CommandResult {
  const input = rawInput.trim();
  if (!input) return { lines: [] };

  const [cmd, ...rest] = input.split(/\s+/);
  const command = cmd.toLowerCase();
  const arg = rest.join(" ");

  switch (command) {
    case "help":
    case "?":
      return {
        lines: [
          { text: "available commands:", kind: "muted" },
          ...COMMANDS.map((c) => ({ text: `  ${pad(c.name, 12)}${c.help}` })),
        ],
      };

    case "whoami":
      return {
        lines: [
          { text: profile.name, kind: "accent" },
          { text: `${profile.role} · ${profile.location}` },
        ],
      };

    case "about":
      return { lines: profile.about.map((text) => ({ text })) };

    case "skills":
      return {
        lines: skills.map((g) => ({ text: `${pad(g.label, 12)}${g.items.join(", ")}` })),
      };

    case "ai":
      return {
        lines: aiToolkit.map((t) => ({ text: `${pad(t.name, 22)}→ ${t.where}` })),
      };

    case "ls":
    case "projects":
      return {
        lines: projects.map((p) => ({
          text: `${pad(p.slug + "/", 20)}${pad(p.name, 24)}[${p.status}]`,
          kind: p.status === "live" ? "accent" : "default",
          href: p.liveUrl,
        })),
      };

    case "experience":
      return {
        lines: experience.flatMap((e) => [
          { text: `${e.period}`, kind: "warn" as const },
          { text: `${e.role} · ${e.company}`, kind: "accent" as const },
        ]),
      };

    case "certs":
      return {
        lines: certificates.map((c) => ({
          text: `${c.year}  ${c.name}${c.issuer ? " — " + c.issuer : ""}`,
        })),
      };

    case "contact":
      return {
        lines: [
          { text: `email     ${profile.email}`, href: `mailto:${profile.email}` },
          {
            text: `linkedin  ${profile.linkedin.replace("https://www.", "")}`,
            href: profile.linkedin,
          },
        ],
      };

    case "linkedin":
      return {
        lines: [{ text: "opening LinkedIn…", kind: "muted" }],
        action: { type: "open", url: profile.linkedin },
      };

    case "email":
    case "mail":
      return {
        lines: [{ text: `opening your mail app → ${profile.email}`, kind: "muted" }],
        action: { type: "open", url: `mailto:${profile.email}` },
      };

    case "clear":
    case "cls":
      return { lines: [], action: { type: "clear" } };

    case "echo":
      return { lines: [{ text: arg }] };

    case "pwd":
      return { lines: [{ text: `/home/${profile.handle}` }] };

    case "date":
      return { lines: [{ text: new Date().toString() }] };

    case "sudo":
      return {
        lines: [
          { text: "permission denied — but you can still hire me:", kind: "warn" },
          { text: `  ${profile.email}`, href: `mailto:${profile.email}` },
        ],
      };

    case "exit":
      return { lines: [{ text: "nice try. this terminal lives here now :)", kind: "muted" }] };

    default:
      return {
        lines: [{ text: `command not found: ${command}. type 'help'`, kind: "error" }],
      };
  }
}
