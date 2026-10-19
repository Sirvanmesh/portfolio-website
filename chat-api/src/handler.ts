/**
 * AWS Lambda entry point, served by a Lambda function URL.
 * The Anthropic key is read from SSM Parameter Store (encrypted), never from the website.
 * CORS headers are added by the function URL settings in Terraform.
 */
import {
  ConditionalCheckFailedException,
  DynamoDBClient,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { createAsk, createChatHandler, type AskFn, type CountFn } from "./core";

interface FunctionUrlEvent {
  headers?: Record<string, string | undefined>;
  body?: string;
  isBase64Encoded?: boolean;
  requestContext: { http: { method: string; sourceIp: string } };
}

const TABLE = process.env.RATE_LIMIT_TABLE ?? "";
const KEY_PARAM = process.env.ANTHROPIC_KEY_PARAM ?? "";
const ORIGINS = (process.env.ALLOWED_ORIGINS ?? "").split(",").filter(Boolean);

const dynamo = new DynamoDBClient({});

const count: CountFn = async (key, window, now) => {
  const bucket = Math.floor(now / window.seconds);
  try {
    await dynamo.send(
      new UpdateItemCommand({
        TableName: TABLE,
        Key: { pk: { S: `${key}#${window.name}#${bucket}` } },
        UpdateExpression: "ADD n :one SET expires_at = :ttl",
        ConditionExpression: "attribute_not_exists(n) OR n < :limit",
        ExpressionAttributeValues: {
          ":one": { N: "1" },
          ":limit": { N: String(window.limit) },
          ":ttl": { N: String((bucket + 1) * window.seconds + 3600) },
        },
      }),
    );
    return true;
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) return false;
    throw err;
  }
};

// Cached for the life of the Lambda container, so SSM is called once per cold start.
let askPromise: Promise<AskFn> | undefined;
function getAsk(): Promise<AskFn> {
  askPromise ??= (async () => {
    const res = await new SSMClient({}).send(
      new GetParameterCommand({ Name: KEY_PARAM, WithDecryption: true }),
    );
    const key = res.Parameter?.Value;
    if (!key) throw new Error("Anthropic key parameter is empty");
    return createAsk(key);
  })().catch((err) => {
    askPromise = undefined;
    throw err;
  });
  return askPromise;
}

const handle = createChatHandler({
  allowedOrigins: ORIGINS,
  count,
  ask: async (messages) => (await getAsk())(messages),
});

export async function handler(event: FunctionUrlEvent) {
  const body =
    event.body && event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;
  const res = await handle({
    method: event.requestContext.http.method,
    origin: event.headers?.origin,
    ip: event.requestContext.http.sourceIp,
    body,
  });
  return {
    statusCode: res.status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
    body: JSON.stringify(res.body),
  };
}
