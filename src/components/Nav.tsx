"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { profile } from "@/content/profile";
import { PAGES, pagePath } from "@/lib/pages";

export default function Nav() {
  const current = (usePathname() ?? "/").replace(/\/?$/, "/");

  return (
    <header className="nav">
      <nav className="container nav-inner" aria-label="Main">
        <Link href="/" className="nav-brand" aria-current={current === "/" ? "page" : undefined}>
          ~/{profile.handle}
        </Link>
        <ul className="nav-links">
          {PAGES.map((p) => {
            const href = pagePath(p.slug);
            return (
              <li key={p.slug}>
                <Link
                  href={href}
                  className={p.slug === "contact" ? "nav-cta" : undefined}
                  aria-current={current === href ? "page" : undefined}
                >
                  ./{p.slug}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
