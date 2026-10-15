# Add a project to the portfolio

Every course project you finish becomes a new card on the site.

1. Open `src/content/profile.ts`.
2. Add an entry to `projects` (keep the number order):

```ts
{
  slug: "10-sql-copilot",               // NN-short-name, lowercase
  name: "SQL Copilot",
  summary: "Paste a SQL query and get a plain-English explanation and faster rewrite.", // one sentence, max 110 chars
  tags: ["next.js", "fastapi", "aws lambda"],
  status: "live",                        // "live" | "private build" | "in progress"
  liveUrl: "https://...",                // optional
  repoUrl: "https://github.com/...",     // optional
},
```

3. Add new certificates to `certificates`.
4. Run `npm run check`, then commit and push. The pipeline deploys it to dev, then prod after your approval.

With Claude Code, just say: **"add my new project to the portfolio"**. The `update-portfolio` skill in `.claude/skills` knows these steps.
