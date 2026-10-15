/**
 * Everything the website says lives in this one file.
 * To add a new project: add an object to `projects` (see docs/ADD_A_PROJECT.md).
 */

export type ProjectStatus = "live" | "private build" | "in progress";

export interface Project {
  /** folder-style id shown in the terminal, e.g. "01-portfolio" */
  slug: string;
  name: string;
  /** one short, plain sentence */
  summary: string;
  tags: string[];
  status: ProjectStatus;
  liveUrl?: string;
  repoUrl?: string;
}

export interface Experience {
  role: string;
  company: string;
  location: string;
  period: string;
  highlights: string[];
}

export interface Certificate {
  name: string;
  /** leave out when unknown */
  issuer?: string;
  year: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface AiTool {
  name: string;
  where: string;
}

export const profile = {
  name: "Mohammad Afsharnejad",
  handle: "mohammad",
  role: "Data & Automation Analyst",
  location: "Calgary, Alberta",
  tagline: "I turn messy data into clear reports, automations and AI tools.",
  intro:
    "Data & Automation Analyst working with Oracle SQL, Power BI and Python — now building AI apps and shipping them on AWS.",
  email: "mohamadafsharnejad@gmail.com",
  linkedin: "https://www.linkedin.com/in/mohammad-afshar-nejad-18393824b",
  /** set after the GitHub repo exists, e.g. "https://github.com/<you>/portfolio-website" */
  sourceUrl: "",
  about: [
    "I build reporting datasets, Power BI dashboards and automations that take repetitive work off people's plates.",
    "Outside work I build AI tools: multi-agent systems, local models, and apps where an AI coding agent does the heavy lifting while I design the system.",
    "Industrial Engineering background, Business Administration diploma from SAIT.",
  ],
};

export const skills: SkillGroup[] = [
  { label: "data", items: ["Oracle SQL", "PL/SQL", "Power BI", "Power Query", "Excel", "Python"] },
  { label: "automation", items: ["Power Automate", "SharePoint", "VBA", "FME"] },
  {
    label: "ai",
    items: ["Claude Code", "AI agents", "MCP", "Ollama", "Whisper", "Prompt design"],
  },
  { label: "cloud", items: ["AWS", "Terraform", "GitHub Actions", "Docker", "Next.js", "FastAPI"] },
];

export const aiToolkit: AiTool[] = [
  { name: "Multi-agent systems", where: "trading analyst team, job search assistant" },
  { name: "Tool use with MCP", where: "an AI that directs Blender to make 3D shorts" },
  { name: "Local models", where: "offline notes and music tools that cost nothing to run" },
  { name: "Speech & audio AI", where: "video-to-notes transcription, AI duet vocals" },
  { name: "Vision", where: "agents that read chart screenshots" },
  { name: "Cost-aware design", where: "local first, cloud AI only where it adds real value" },
];

export const experience: Experience[] = [
  {
    role: "Land Applications & Reporting Analyst",
    company: "PrairieSky Royalty Ltd",
    location: "Calgary, AB",
    period: "Oct 2024 — Present",
    highlights: [
      "Build and maintain reporting datasets with Oracle SQL, Excel and Power Query.",
      "Develop Power BI dashboards and Power Platform solutions that cut manual effort.",
      "Automate recurring reports, data cleaning and mass updates with Power Automate, Python, SQL, VBA, SharePoint and FME.",
      "Troubleshoot data and workflow issues and document processes for the team.",
    ],
  },
];

export const projects: Project[] = [
  {
    slug: "01-portfolio",
    name: "This portfolio",
    summary: "A static site on AWS, rebuilt and deployed automatically on every git push.",
    tags: ["next.js", "s3 + cloudfront", "terraform", "github-actions"],
    status: "live",
  },
  {
    slug: "02-trading-ai",
    name: "Trading AI Platform",
    summary: "Backtests price-action strategies; an AI reads the market around each signal.",
    tags: ["python", "ai agents", "backtesting"],
    status: "private build",
  },
  {
    slug: "03-chart-analyst",
    name: "AI Chart Analyst",
    summary: "A small team of AI agents that looks at chart pictures and explains the setup.",
    tags: ["multi-agent", "vision", "fastapi"],
    status: "private build",
  },
  {
    slug: "04-shorts-studio",
    name: "Blender Shorts Studio",
    summary: "Type an idea, get a 3D animated short — an AI agent directs Blender.",
    tags: ["mcp", "blender", "automation"],
    status: "private build",
  },
  {
    slug: "05-vocal-studio",
    name: "AI Vocal Studio",
    summary: "Makes duet songs with a local AI singer, fully offline on a regular PC.",
    tags: ["local ai", "audio", "fastapi"],
    status: "private build",
  },
  {
    slug: "06-video-notes",
    name: "VideoCourseNotes",
    summary: "Turns a course video into clean Word notes with screenshots — free in local mode.",
    tags: ["whisper", "ollama", "ocr"],
    status: "private build",
  },
  {
    slug: "07-job-hunter",
    name: "Job Hunter",
    summary: "Finds jobs, checks how well they fit, and tailors the resume for each one.",
    tags: ["ai agents", "browser automation"],
    status: "private build",
  },
  {
    slug: "08-animation-bot",
    name: "HyperFrames",
    summary: "Makes animated YouTube videos, controlled from a Telegram chat.",
    tags: ["telegram bot", "video automation"],
    status: "private build",
  },
  {
    slug: "09-front-desk",
    name: "Front Desk Assistant",
    summary: "An AI receptionist that answers calls and books jobs for small trades businesses.",
    tags: ["voice ai", "twilio", "terraform"],
    status: "in progress",
  },
];

export const certificates: Certificate[] = [
  { name: "Data Analyst Nanodegree", issuer: "Udacity", year: "2025" },
  { name: "Business Analytics Nanodegree", issuer: "Udacity", year: "2025" },
  { name: "Programming with Python for Data Science Nanodegree", issuer: "Udacity", year: "2025" },
  { name: "The Complete Oracle SQL Bootcamp", issuer: "Udemy", year: "2025" },
  { name: "The Complete PL/SQL Bootcamp", issuer: "Udemy", year: "2025" },
  { name: "Advanced SQL: The Ultimate Guide", issuer: "Udemy", year: "2025" },
  { name: "FME Essentials", issuer: "Udemy", year: "2025" },
  { name: "Power BI", issuer: "LinkedIn Learning", year: "2024" },
  { name: "Lean Six Sigma Yellow & Green Belt", year: "2023" },
];
