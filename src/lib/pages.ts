/** The site's pages, in menu order. Used by the nav, the page headers and the terminal's `ls` / `cd`. */
export interface Page {
  /** folder name, also the URL: /<slug>/ */
  slug: string;
  title: string;
  /** one short line shown under the title and in `ls` */
  lead: string;
}

export const PAGES: Page[] = [
  { slug: "about", title: "About", lead: "who I am and what I work with" },
  { slug: "experience", title: "Experience", lead: "where I work" },
  { slug: "projects", title: "Projects", lead: "things I've built" },
  { slug: "certificates", title: "Certificates", lead: "courses and certificates" },
  { slug: "contact", title: "Contact", lead: "how to reach me" },
];

export const pagePath = (slug: string) => `/${slug}/`;

const ALIASES: Record<string, string> = { certs: "certificates", exp: "experience" };

/**
 * Turns what someone typed after `cd` into a URL path.
 * Returns "/" for home, a page path, or null when there is no such page.
 */
export function resolvePage(raw: string): string | null {
  const name = raw
    .trim()
    .toLowerCase()
    .replace(/^~\/?/, "")
    .replace(/^\.\.?\/?/, "")
    .replace(/\/+$/, "");
  if (name === "" || name === "home" || name === "..") return "/";
  const slug = ALIASES[name] ?? name;
  return PAGES.some((p) => p.slug === slug) ? pagePath(slug) : null;
}
