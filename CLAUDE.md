# Portfolio website — notes for Claude Code

Mohammad's personal portfolio: a terminal-style static Next.js site, deployed to AWS S3 + CloudFront with Terraform and GitHub Actions.

## Always

- **Use skills.** Before starting, check `.claude/skills/` and any installed skills (for example a frontend-design skill) and load every one that fits the task. For content changes, use `update-portfolio`.
- **Content lives in one file:** `src/content/profile.ts`. Never hard-code profile text in components.
- **Never invent facts** about Mohammad (jobs, dates, numbers, certificates). Ask him.
- **Never mention his employer's internal systems** (no LandRite, no internal tools or data). A unit test enforces this.
- Keep the look: dark terminal theme, JetBrains Mono, green accent `#4ade80`, `$ command` section headers. Colors are CSS variables in `src/app/globals.css`.
- Keep it accessible: real buttons and links, labels on inputs, 4.5:1 text contrast, respect `prefers-reduced-motion`, no horizontal scroll on phones.
- Keep it free to run: static export only (no server, no API routes). Anything that would add AWS cost must be raised with Mohammad first.

## Before every commit

Run `npm run check` (lint, unit tests, build, browser tests). Fix failures before committing.
Browser tests need `npx playwright install chromium` once.

## Layout

| Path                         | What                                                       |
| ---------------------------- | ---------------------------------------------------------- |
| `src/content/profile.ts`     | All text: profile, skills, projects, experience, certs     |
| `src/lib/terminal.ts`        | Interactive terminal commands (pure function, unit tested) |
| `src/components/`            | Page sections, `Terminal`, `TypedText`                     |
| `infra/bootstrap/`           | One-time CloudFormation: OIDC role, state bucket, budget   |
| `infra/modules/static-site/` | S3 + CloudFront module                                     |
| `infra/envs/{dev,prod}/`     | Terraform roots per environment                            |
| `.github/workflows/`         | CI/CD: test → dev → (approval) → prod; manual destroy      |
| `docs/`                      | Setup and how-to guides                                    |

## Adding a terminal command

Add it to `COMMANDS` and the `switch` in `src/lib/terminal.ts`, then add a unit test in `tests/unit/terminal.test.ts`.
