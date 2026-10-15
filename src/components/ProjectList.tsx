"use client";

import { useState } from "react";
import { projects, type Project, type ProjectStatus } from "@/content/profile";

const statusClass: Record<ProjectStatus, string> = {
  live: "status-live",
  "private build": "status-private",
  "in progress": "status-progress",
};

const FILTERS: ("all" | ProjectStatus)[] = ["all", "live", "in progress", "private build"];

export default function ProjectList() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const shown = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  return (
    <>
      <div className="filters" role="group" aria-label="Filter projects">
        {FILTERS.filter((f) => f === "all" || projects.some((p) => p.status === f)).map((f) => (
          <button
            key={f}
            type="button"
            className="chip"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? `all (${projects.length})` : f}
          </button>
        ))}
      </div>
      <ul className="projects" aria-live="polite">
        {shown.map((p) => (
          <li key={p.slug}>
            <ProjectCard project={p} />
          </li>
        ))}
      </ul>
    </>
  );
}

function ProjectCard({ project: p }: { project: Project }) {
  return (
    <article className={`project ${p.status === "live" ? "project-live" : ""}`}>
      <div className="project-top">
        <span className="project-slug">{p.slug}/</span>
        <span className={`status ${statusClass[p.status]}`}>[{p.status}]</span>
      </div>
      <h2 className="project-name">{p.name}</h2>
      <p className="project-summary">{p.summary}</p>
      <ul className="tags" aria-label="Tech">
        {p.tags.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      {(p.liveUrl || p.repoUrl) && (
        <span className="project-links">
          {p.liveUrl && (
            <a href={p.liveUrl} target="_blank" rel="noopener noreferrer">
              open ↗
            </a>
          )}
          {p.repoUrl && (
            <a href={p.repoUrl} target="_blank" rel="noopener noreferrer">
              code ↗
            </a>
          )}
        </span>
      )}
    </article>
  );
}
