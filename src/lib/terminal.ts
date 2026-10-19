import { aiToolkit, certificates, experience, profile, projects, skills } from "@/content/profile";
import { PAGES, pagePath, resolvePage } from "./pages";

export type LineKind = "default" | "muted" | "accent" | "warn" | "error";

export interface OutputLine {
  text: string;
  kind?: LineKind;
  href?: string;
}

export type TerminalAction =
  { type: "clear" } | { type: "open"; url: string } | { type: "navigate"; path: string };

export interface CommandResult {
  lines: OutputLine[];
  action?: TerminalAction;
}

export const COMMANDS: { name: string; help: string }[] = [
  { name: "help", help: "list commands" },
  { name: "ls", help: "list the pages of this site" },
  { name: "cd <page>", help: "open a page, e.g. cd projects" },
  { name: "whoami", help: "who I am" },
  { name: "about", help: "a little about me" },
  { name: "skills", help: "what I work with" },
  { name: "ai", help: "the AI techniques I use" },
  { name: "projects", help: "things I've built" },
  { name: "experience", help: "where I work" },
  { name: "certs", help: "certificates" },
  { name: "contact", help: "how to reach me" },
  { name: "linkedin", help: "open my LinkedIn" },
  { name: "email", help: "write me an email" },
  { name: "clear", help: "clear the screen" },
];

const pad = (s: string, n: number) => (s.length >= n ? s + " " : s + " ".repeat(n - s.length));

/** Last line of a short answer: a link to the page with the full version. */
const more = (slug: string): OutputLine => ({
  text: `→ cd ${slug}  (full page)`,
  kind: "muted",
  href: pagePath(slug),
});

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

    case "ls":
    case "dir":
      return {
        lines: [
          ...PAGES.map((p) => ({
            text: `${pad(p.slug + "/", 15)}${p.lead}`,
            kind: "accent" as const,
            href: pagePath(p.slug),
          })),
          { text: "type 'cd <page>' or click one to open it", kind: "muted" },
        ],
      };

    case "cd":
    case "open": {
      const path = resolvePage(arg);
      if (!path) {
        return {
          lines: [{ text: `cd: no such page: ${arg}. type 'ls' to see pages`, kind: "error" }],
        };
      }
      return {
        lines: [{ text: `opening ${path === "/" ? "~" : "~" + path}…`, kind: "muted" }],
        action: { type: "navigate", path },
      };
    }

    case "about":
      return { lines: [...profile.about.map((text) => ({ text })), more("about")] };

    case "skills":
      return {
        lines: skills.map((g) => ({ text: `${pad(g.label, 12)}${g.items.join(", ")}` })),
      };

    case "ai":
      return {
        lines: aiToolkit.map((t) => ({ text: `${pad(t.name, 22)}→ ${t.where}` })),
      };

    case "projects":
      return {
        lines: [
          ...projects.map((p) => ({
            text: `${pad(p.slug + "/", 20)}${pad(p.name, 24)}[${p.status}]`,
            kind: p.status === "live" ? ("accent" as const) : ("default" as const),
            href: p.liveUrl,
          })),
          more("projects"),
        ],
      };

    case "experience":
      return {
        lines: [
          ...experience.flatMap((e) => [
            { text: `${e.period}`, kind: "warn" as const },
            { text: `${e.role} · ${e.company}`, kind: "accent" as const },
          ]),
          more("experience"),
        ],
      };

    case "certs":
    case "certificates":
      return {
        lines: [
          ...certificates.map((c) => ({
            text: `${c.year}  ${c.name}${c.issuer ? " — " + c.issuer : ""}`,
          })),
          more("certificates"),
        ],
      };

    case "contact":
      return {
        lines: [
          { text: `email     ${profile.email}`, href: `mailto:${profile.email}` },
          {
            text: `linkedin  ${profile.linkedin.replace("https://www.", "")}`,
            href: profile.linkedin,
          },
          more("contact"),
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
          { text: "permission denied — but you can still say hi:", kind: "warn" },
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
