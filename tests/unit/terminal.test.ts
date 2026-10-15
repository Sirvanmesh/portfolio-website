import { describe, expect, it } from "vitest";
import { COMMANDS, runCommand } from "@/lib/terminal";
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

  it("lists every project for both 'projects' and 'ls'", () => {
    for (const cmd of ["projects", "ls"]) {
      const lines = runCommand(cmd).lines;
      expect(lines).toHaveLength(projects.length);
    }
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
