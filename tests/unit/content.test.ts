import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { certificates, experience, profile, projects } from "@/content/profile";

describe("content", () => {
  it("has a valid email and LinkedIn URL", () => {
    expect(profile.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    expect(profile.linkedin).toMatch(/^https:\/\/(www\.)?linkedin\.com\/in\//);
  });

  it("has unique project slugs in folder style", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^\d{2}-[a-z0-9-]+$/);
  });

  it("keeps project summaries short and readable", () => {
    for (const p of projects) {
      expect(p.summary.length, p.name).toBeLessThanOrEqual(110);
      expect(p.tags.length, p.name).toBeGreaterThan(0);
    }
  });

  it("only uses https links for projects", () => {
    for (const p of projects) {
      if (p.liveUrl) expect(p.liveUrl).toMatch(/^https:\/\//);
      if (p.repoUrl) expect(p.repoUrl).toMatch(/^https:\/\//);
    }
  });

  it("has experience and certificates", () => {
    expect(experience.length).toBeGreaterThan(0);
    expect(certificates.length).toBeGreaterThan(0);
  });

  it("never talks about hiring anywhere on the site", () => {
    const files = readdirSync("src", { recursive: true, encoding: "utf8" }).filter((f) =>
      /\.(ts|tsx)$/.test(f),
    );
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const text = readFileSync(join("src", f), "utf8");
      expect(text, f).not.toMatch(/\bhir(e|es|ed|ing)\b|recruit/i);
    }
  });

  it("never mentions private work systems", () => {
    const all = JSON.stringify({ profile, projects }).toLowerCase();
    for (const word of ["landrite", "laser schema", "land system"]) {
      expect(all).not.toContain(word);
    }
  });
});
