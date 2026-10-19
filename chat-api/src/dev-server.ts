/**
 * Local chat API for development: `npm run chat:dev`.
 * Reads ANTHROPIC_API_KEY from .env (never committed) and listens on http://localhost:8787.
 * Point the site at it with NEXT_PUBLIC_CHAT_API_URL=http://localhost:8787 in .env.local.
 */
import { createServer } from "node:http";
import { createAsk, createChatHandler, createMemoryCounter } from "./core";

const PORT = Number(process.env.CHAT_PORT ?? 8787);
const ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.error("ANTHROPIC_API_KEY is missing. Add it to .env (see .env.example).");
  process.exit(1);
}

const handle = createChatHandler({
  allowedOrigins: ORIGINS,
  count: createMemoryCounter(),
  ask: createAsk(apiKey),
});

createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (origin && ORIGINS.includes(origin)) {
    res.setHeader("access-control-allow-origin", origin);
    res.setHeader("access-control-allow-methods", "POST");
    res.setHeader("access-control-allow-headers", "content-type");
  }
  if (req.method === "OPTIONS") {
    res.writeHead(204).end();
    return;
  }

  let body = "";
  for await (const chunk of req) body += chunk;
  const result = await handle({
    method: req.method ?? "GET",
    origin,
    ip: req.socket.remoteAddress ?? "local",
    body,
  });
  res.writeHead(result.status, { "content-type": "application/json" });
  res.end(JSON.stringify(result.body));
}).listen(PORT, () => console.log(`chat API on http://localhost:${PORT}`));
