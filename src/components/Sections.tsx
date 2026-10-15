import Link from "next/link";
import { aiToolkit, certificates, experience, profile, skills } from "@/content/profile";
import { PAGES, pagePath } from "@/lib/pages";
import TypedText from "./TypedText";
import Terminal from "./Terminal";
import ProjectList from "./ProjectList";

/** Top of every inner page: a typed `cd` line, the title and one short line. */
function PageHead({ slug }: { slug: string }) {
  const page = PAGES.find((p) => p.slug === slug)!;
  return (
    <header className="page-head">
      <span className="prompt">
        <span className="prompt-sign">$</span> <TypedText text={`cd ~/${slug}`} speed={45} />
      </span>
      <h1 className="page-title">{page.title}</h1>
      <p className="page-lead">{`// ${page.lead}`}</p>
    </header>
  );
}

/** Bottom of every inner page: a link to the next page in the menu. */
function NextPage({ slug }: { slug: string }) {
  const i = PAGES.findIndex((p) => p.slug === slug);
  const next = PAGES[(i + 1) % PAGES.length];
  return (
    <nav className="page-next" aria-label="Next page">
      <Link href={pagePath(next.slug)}>
        <span className="prompt-sign">$</span> cd ../{next.slug} <span aria-hidden="true">→</span>
      </Link>
    </nav>
  );
}

function InnerPage({ slug, children }: { slug: string; children: React.ReactNode }) {
  return (
    <div className="container page">
      <PageHead slug={slug} />
      {children}
      <NextPage slug={slug} />
    </div>
  );
}

export function Home() {
  return (
    <div className="container home page">
      <div className="home-intro">
        <span className="prompt">
          <span className="prompt-sign">$</span> <TypedText text="whoami" />
        </span>
        <h1 className="hero-name">
          {profile.name}
          <span aria-hidden="true" className="cursor" />
        </h1>
        <p className="hero-tagline">
          {profile.role} · {profile.location}. {profile.tagline}
        </p>
      </div>
      <Terminal />
      <div className="hero-actions">
        <Link className="btn btn-primary" href={pagePath("projects")}>
          ls projects/
        </Link>
        <Link className="btn" href={pagePath("about")}>
          cat about.md
        </Link>
        <a className="btn" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
          open linkedin ↗
        </a>
      </div>
    </div>
  );
}

export function About() {
  return (
    <InnerPage slug="about">
      <div className="grid-2">
        <div className="card">
          <span className="card-label">// about.md</span>
          {profile.about.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="card">
          <span className="card-label">// skills</span>
          <dl className="skill-list">
            {skills.map((g) => (
              <div key={g.label} className="skill-row">
                <dt className="skill-group">{g.label}</dt>
                <dd>
                  <ul className="tags">
                    {g.items.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <details className="card more">
        <summary>
          <span className="prompt-sign">$</span> cat ai_toolkit.json
          <span className="more-hint"> — how I use AI</span>
        </summary>
        <ul className="toolkit">
          {aiToolkit.map((t) => (
            <li key={t.name}>
              <strong>{t.name}</strong>
              <span>→ {t.where}</span>
            </li>
          ))}
        </ul>
      </details>
    </InnerPage>
  );
}

export function Experience() {
  return (
    <InnerPage slug="experience">
      {experience.map((e) => (
        <div className="timeline" key={e.company + e.role}>
          <span className="timeline-period">{e.period}</span>
          <h2 className="timeline-role">
            {e.role} · {e.company}
          </h2>
          <span className="prompt">{e.location}</span>
          <ul>
            {e.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      ))}
    </InnerPage>
  );
}

export function Projects() {
  return (
    <InnerPage slug="projects">
      <ProjectList />
    </InnerPage>
  );
}

export function Certificates() {
  return (
    <InnerPage slug="certificates">
      <ul className="certs">
        {certificates.map((c) => (
          <li key={c.name}>
            <span className="year">{c.year}</span>
            <span>
              {c.name}
              {c.issuer && <span className="issuer"> — {c.issuer}</span>}
            </span>
          </li>
        ))}
      </ul>
    </InnerPage>
  );
}

export function Contact() {
  return (
    <InnerPage slug="contact">
      <div className="window">
        <div className="window-body contact-body">
          <p className="contact-title">Let&apos;s talk data, automation and AI.</p>
          <p className="contact-note">
            The quickest way to reach me is email. I&apos;m also on LinkedIn.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={`mailto:${profile.email}`}>
              email me
            </a>
            <a className="btn" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              linkedin ↗
            </a>
          </div>
        </div>
      </div>
    </InnerPage>
  );
}
