import {
  aiToolkit,
  certificates,
  experience,
  profile,
  projects,
  skills,
  type Project,
} from "@/content/profile";
import TypedText from "./TypedText";
import Terminal from "./Terminal";

function SectionHead({ command, title }: { command: string; title: string }) {
  return (
    <h2 className="section-head">
      <span className="prompt-sign">$</span> {command}
      <span className="sr-only"> — </span> <span className="section-title sr-only">{title}</span>
    </h2>
  );
}

export function Nav() {
  return (
    <header className="nav">
      <nav className="container nav-inner" aria-label="Main">
        <a href="#top" className="nav-brand">
          ~/{profile.handle}
        </a>
        <ul className="nav-links">
          <li>
            <a href="#about">./about</a>
          </li>
          <li>
            <a href="#experience">./experience</a>
          </li>
          <li>
            <a href="#projects">./projects</a>
          </li>
          <li>
            <a href="#certificates">./certificates</a>
          </li>
          <li>
            <a href="#contact" className="nav-cta">
              ./contact
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export function Hero() {
  return (
    <section id="top" className="container hero" aria-label="Introduction">
      <div className="window">
        <div className="window-bar">
          <span aria-hidden="true" className="dot dot-red" />
          <span aria-hidden="true" className="dot dot-amber" />
          <span aria-hidden="true" className="dot dot-green" />
          <span className="window-title">{profile.handle}@calgary: ~</span>
        </div>
        <div className="window-body">
          <span className="prompt">
            <span className="prompt-sign">$</span> <TypedText text="whoami" />
          </span>
          <h1 className="hero-name">
            {profile.name}
            <span aria-hidden="true" className="cursor" />
          </h1>
          <p className="hero-tagline">
            {profile.role}. {profile.tagline} Now building AI apps and shipping them on AWS.
          </p>
          <span className="prompt">
            <span className="prompt-sign">$</span> cat location.txt →{" "}
            <span style={{ color: "var(--text)" }}>{profile.location}</span>
          </span>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#projects">
              ls projects/
            </a>
            <a className="btn" href="#terminal">
              try the terminal
            </a>
            <a className="btn" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              open linkedin
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TerminalSection() {
  return (
    <section id="terminal" className="container section" aria-labelledby="terminal-title">
      <h2 id="terminal-title" className="section-head">
        <span className="prompt-sign">$</span> ./terminal --interactive
      </h2>
      <Terminal />
    </section>
  );
}

export function About() {
  return (
    <section id="about" className="container section" aria-label="About and skills">
      <SectionHead command="cat about.md skills.sql" title="About and skills" />
      <div className="grid-2">
        <div className="card">
          <span className="card-label">// about.md</span>
          {profile.about.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="card">
          <span className="card-label">// skills.sql</span>
          <span className="skill-row">
            <span className="kw">SELECT</span> skill <span className="kw">FROM</span>{" "}
            {profile.handle}
          </span>
          <span className="skill-row">
            <span className="kw">GROUP BY</span> area;
          </span>
          <dl className="skill-list">
            {skills.map((g) => (
              <div key={g.label} style={{ display: "contents" }}>
                <dt className="skill-group">{g.label}</dt>
                <dd style={{ margin: 0 }}>{g.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export function AiToolkit() {
  return (
    <section id="ai" className="container section" aria-label="AI toolkit">
      <SectionHead command="cat ai_toolkit.json" title="AI toolkit" />
      <ul className="toolkit">
        {aiToolkit.map((t) => (
          <li key={t.name}>
            <strong>{t.name}</strong>
            <span>→ {t.where}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Experience() {
  return (
    <section id="experience" className="container section" aria-label="Experience">
      <SectionHead command="git log --career" title="Experience" />
      {experience.map((e) => (
        <div className="timeline" key={e.company + e.role}>
          <span className="timeline-period">{e.period}</span>
          <h3 className="timeline-role">
            {e.role} · {e.company}
          </h3>
          <span className="prompt">{e.location}</span>
          <ul>
            {e.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

const statusClass: Record<Project["status"], string> = {
  live: "status-live",
  "private build": "status-private",
  "in progress": "status-progress",
};

export function Projects() {
  return (
    <section id="projects" className="container section" aria-label="Projects">
      <SectionHead command="ls projects/" title="Projects" />
      <ul className="projects">
        {projects.map((p) => (
          <li key={p.slug}>
            <article className={`project ${p.status === "live" ? "project-live" : ""}`}>
              <span className="project-slug">{p.slug}/</span>
              <h3 className="project-name">{p.name}</h3>
              <p className="project-summary">{p.summary}</p>
              <ul className="tags" aria-label="Tech">
                {p.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <span className={`status ${statusClass[p.status]}`}>[{p.status}]</span>
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
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Certificates() {
  return (
    <section id="certificates" className="container section" aria-label="Certificates">
      <SectionHead command="ls certificates/" title="Certificates" />
      <div className="card">
        <span className="card-label">// certificates</span>
        <ul className="certs">
          {certificates.map((c) => (
            <li key={c.name}>
              <span className="year">{c.year}</span>
              {c.name}
              {c.issuer && <span className="issuer"> — {c.issuer}</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" className="container section" aria-label="Contact">
      <SectionHead command="./contact --now" title="Contact" />
      <div className="window">
        <div className="window-body contact-body">
          <p className="contact-title">Let&apos;s talk data, automation and AI.</p>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            The quickest way to reach me is email. I&apos;m also on LinkedIn.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={`mailto:${profile.email}`}>
              email me
            </a>
            <a className="btn" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              linkedin
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>
          next.js → s3 + cloudfront · terraform · github actions
          {profile.sourceUrl && (
            <>
              {" · "}
              <a href={profile.sourceUrl} target="_blank" rel="noopener noreferrer">
                source
              </a>
            </>
          )}
        </span>
      </div>
    </footer>
  );
}
