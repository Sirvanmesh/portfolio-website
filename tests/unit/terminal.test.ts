import { describe, expect, it } from "vitest";
import { COMMANDS, runCommand } from "@/lib/terminal";
import { PAGES } from "@/lib/pages";
import { profile, projects } from "@/content/profile";

describe("runCommand", () => {
  it("returns nothing for empty input", () => {
    expect(runCommand("   ").lines).toEqual([]);
  });

  it("lists every command in help", () => {
    const text = runCommand("help")
      .lines.map((l) => l.text)
      .join("\n");
    for (const c of COMMANDS) expect(text).toContain(c.name);
  });

  it("is case-insensitive and trims input", () => {
    expect(runCommand("  WHOAMI ").lines[0].text).toBe(profile.name);
  });

  it("lists every project, then links to the projects page", () => {
    const lines = runCommand("projects").lines;
    expect(lines).toHaveLength(projects.length + 1);
    expect(lines.at(-1)?.href).toBe("/projects/");
  });

  it("lists every page for 'ls', each linking to its page", () => {
    const links = runCommand("ls")
      .lines.map((l) => l.href)
      .filter(Boolean);
    expect(links).toEqual(PAGES.map((p) => `/${p.slug}/`));
  });

  it("navigates with 'cd', accepting folder-style paths and aliases", () => {
    const path = (input: string) => {
      const action = runCommand(input).action;
      return action?.type === "navigate" ? action.path : undefined;
    };
    expect(path("cd projects")).toBe("/projects/");
    expect(path("cd ./About/")).toBe("/about/");
    expect(path("cd ~/certs")).toBe("/certificates/");
    expect(path("open contact")).toBe("/contact/");
    for (const home of ["cd", "cd ~", "cd ..", "cd home"]) expect(path(home)).toBe("/");
  });

  it("explains unknown pages for 'cd'", () => {
    const result = runCommand("cd secrets");
    expect(result.action).toBeUndefined();
    expect(result.lines[0].kind).toBe("error");
    expect(result.lines[0].text).toContain("no such page: secrets");
  });

  it("returns a clear action", () => {
    expect(runCommand("clear").action).toEqual({ type: "clear" });
  });

  it("opens mailto for email", () => {
    expect(runCommand("email").action).toEqual({
      type: "open",
      url: `mailto:${profile.email}`,
    });
  });

  it("explains unknown commands", () => {
    const [line] = runCommand("rm -rf /").lines;
    expect(line.kind).toBe("error");
    expect(line.text).toContain("command not found: rm");
  });

  it("echoes text", () => {
    expect(runCommand("echo hello world").lines[0].text).toBe("hello world");
  });
});
