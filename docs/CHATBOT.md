# Chat bot

The `ask_mohammad.ai` button at the bottom right opens a terminal-style chat. It answers questions about Mohammad only, using Claude Haiku. Its facts come from `src/content/profile.ts`, so it always matches the website.

## How it works

```
browser ──POST──> Lambda function URL ──> Claude API (Haiku)
                     │
                     ├─ DynamoDB: per-visitor rate limit
                     └─ SSM Parameter Store: Anthropic key (encrypted)
```

- The website is still a static export. It never holds the Anthropic key.
- The deploy job writes `/chat-config.json` with the chat API address, so the site needs no rebuild.
- If the chat API is missing or down, the bot shows Mohammad's email and LinkedIn instead.

## Spam and cost protection

| Guard                                              | Where                                                                   |
| -------------------------------------------------- | ----------------------------------------------------------------------- |
| 10 questions per hour, 30 per day, per visitor IP  | DynamoDB counters, auto-deleted with TTL. IPs are hashed, never stored. |
| Only the site's own origin can call it             | Function URL CORS plus an origin check in the Lambda.                   |
| Question max 600 characters, last 10 messages only | `src/lib/chat.ts`, checked in the browser and in the Lambda.            |
| Hidden form field that only bots fill in           | Request rejected before Claude is called.                               |
| Answers capped at 1024 tokens, low effort, Haiku   | `chat-api/src/core.ts`.                                                 |
| Off-topic questions and prompt tricks are declined | System prompt in `chat-api/src/prompt.ts`.                              |

Limits live in `CHAT_LIMITS` in `src/lib/chat.ts`.

**Also set a spend limit in the Anthropic Console** (Settings → Limits). It is the only hard stop on API cost if many different IP addresses send questions. At Haiku prices one question costs well under a tenth of a cent.

AWS cost: Lambda, DynamoDB on-demand and Parameter Store standard parameters stay inside the free tier or cost cents at portfolio traffic.

## One-time setup (AWS CloudShell)

Do these in order before pushing the chat code to `main`. The local `AiEngineer` user cannot update the bootstrap stack, so use CloudShell.

1. **Update the bootstrap stack.** It adds the chat permissions to the deploy role and creates the permissions boundary `portfolio-website-chat-boundary`. Upload `infra/bootstrap/bootstrap.yaml` to CloudShell and rerun the deploy command from `docs/SETUP_AWS.md` with the same parameters as before, including `GitHubSubjectPrefix` and `ExistingOIDCProviderArn`.

2. **Store the Anthropic key.** Create a key in the Anthropic Console that is only for this site. Then run:

   ```bash
   read -s -p "Anthropic key: " KEY && echo
   aws ssm put-parameter --name /portfolio-website/anthropic-api-key \
     --type SecureString --value "$KEY" --overwrite
   unset KEY
   ```

   `read -s` keeps the key out of the shell history. Dev and prod share this one parameter.

3. **Push to `main`.** The pipeline builds the Lambda bundle, creates the chat API with Terraform and points the site at it.

To rotate the key, run step 2 again with the new key. Running Lambdas pick it up on their next cold start (within minutes to hours). Delete the old key in the Anthropic Console afterwards.

## Local development

1. Copy `.env.example` to `.env` and paste your Anthropic key into `ANTHROPIC_API_KEY`.
2. Create `.env.local` with `NEXT_PUBLIC_CHAT_API_URL=http://localhost:8787`.
3. In one terminal: `npm run chat:dev`. In another: `npm run dev`.

Only the local chat API reads `.env`. Never put the key in a `NEXT_PUBLIC_` variable: Next.js publishes those in the site's JavaScript.

## Files

| Path                         | What                                                 |
| ---------------------------- | ---------------------------------------------------- |
| `src/components/ChatBot.tsx` | The chat widget                                      |
| `src/lib/chat.ts`            | Limits and request checks shared by widget and API   |
| `chat-api/src/core.ts`       | Request handling, rate limit logic, Claude call      |
| `chat-api/src/prompt.ts`     | System prompt built from `profile.ts`                |
| `chat-api/src/handler.ts`    | Lambda entry: DynamoDB counter, key from SSM         |
| `chat-api/src/dev-server.ts` | Local chat API on port 8787                          |
| `infra/modules/chat-api/`    | Lambda, function URL, DynamoDB table, IAM role, logs |
