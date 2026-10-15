---
name: update-portfolio
description: Use when Mohammad wants to add a new project, add a certificate, or change any text on his portfolio website.
---

# Update the portfolio

All content is in `src/content/profile.ts`. Change only that file unless the request needs a new feature.

## Add a project

1. Ask for anything missing: name, one-sentence summary (what it does for a user, max 110 chars), 2–4 tags, status (`live`, `private build`, `in progress`), and the live URL and repo URL if there are any. Never invent them.
   If the project folder is on this PC (usually `Desktop\PROJECTS\<name>`), read its README to suggest a summary and tags, then confirm them with Mohammad.
2. Add it to `projects` with the next number: `slug: "NN-short-name"`.
3. Keep it simple and non-technical. No internal or employer details.

## Add a certificate

- Add it to `certificates` (`name`, `issuer`, `year`). Never invent them.

## Finish

1. Run `npm run check`. Every check must pass.
2. Commit with a short message, for example `content: add SQL Copilot project`, then push to `main`.
3. Remind Mohammad to approve the **prod** deployment in GitHub → Actions.
