#!/usr/bin/env node
/**
 * Action1 MCP Server
 *
 * Provides MCP tools for Action1 patch management + endpoint inventory.
 * All tools listed upfront for compatibility with remote connectors
 * (claude.ai, mcp-remote) that don't support tools/list_changed.
 *
 * Transports:
 *   stdio (default) — for local CLI usage
 *   http — set MCP_TRANSPORT=http for hosted/gateway deployments
 *
 * Credentials (stdio mode):
 *   ACTION1_API_KEY, ACTION1_SECRET, ACTION1_REGION (default NorthAmerica),
 *   ACTION1_DEFAULT_ORG_ID (optional)
 *
 * Credentials (gateway mode, AUTH_MODE=gateway): from request headers
 *   X-Action1-API-Key, X-Action1-Secret, X-Action1-Region, X-Action1-Default-Org-Id
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { getDomainHandler, getAvailableDomains } from "./domains/index.js";
import { isDomainName } from "./utils/types.js";
import { runWithCredentials, type Action1Credentials, type Action1Region } from "./utils/client.js";

const navigateTool: Tool = {
  name: "action1_navigate",
  description:
    "Discover available Action1 tools by domain. All tools are callable at any time — this is a help/discovery aid.",
  inputSchema: {
    type: "object",
    properties: {
      domain: {
        type: "string",
        enum: getAvailableDomains(),
        description:
          "endpoints (device inventory), organizations (multi-tenant MSP), " +
          "policies (automation visibility), updates (missing patches).",
      },
    },
    required: ["domain"],
  },
};

async function listAllTools(): Promise<Tool[]> {
  const tools: Tool[] = [navigateTool];
  for (const d of getAvailableDomains()) {
    const handler = await getDomainHandler(d);
    tools.push(...handler.tools);
  }
  return tools;
}

async function dispatchTool(
  name: string,
  args: Record<string, unknown>,
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  if (name === "action1_navigate") {
    const domain = args.domain as string;
    if (!isDomainName(domain)) {
      throw new Error(`Unknown domain: ${domain}`);
    }
    const handler = await getDomainHandler(domain);
    const summary = handler.tools.map((t) => ({ name: t.name, description: t.description }));
    return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
  }
  for (const d of getAvailableDomains()) {
    const handler = await getDomainHandler(d);
    if (handler.tools.some((t) => t.name === name)) {
      return handler.handle(name, args);
    }
  }
  throw new Error(`Unknown tool: ${name}`);
}

function buildServer(): Server {
  const server = new Server(
    { name: "action1-mcp", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: await listAllTools(),
  }));
  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;
    return dispatchTool(name, (args ?? {}) as Record<string, unknown>);
  });
  return server;
}

function credentialsFromHeaders(req: IncomingMessage): Action1Credentials | null {
  const apiKey = req.headers["x-action1-api-key"];
  const secret = req.headers["x-action1-secret"];
  const region = req.headers["x-action1-region"];
  const defaultOrgId = req.headers["x-action1-default-org-id"];
  if (typeof apiKey !== "string" || typeof secret !== "string") return null;
  return {
    apiKey,
    secret,
    region: (typeof region === "string" ? region : "NorthAmerica") as Action1Region,
    defaultOrgId: typeof defaultOrgId === "string" ? defaultOrgId : undefined,
  };
}

async function startHttp(): Promise<void> {
  const port = Number(process.env.PORT ?? 8080);
  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => crypto.randomUUID() });
  await server.connect(transport);

  createServer((req: IncomingMessage, res: ServerResponse) => {
    const creds = credentialsFromHeaders(req);
    const handle = () => transport.handleRequest(req, res);
    if (creds) {
      runWithCredentials(creds, handle);
    } else {
      handle();
    }
  }).listen(port, () => {
    console.error(`action1-mcp HTTP listening on :${port}`);
  });
}

async function startStdio(): Promise<void> {
  const server = buildServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("action1-mcp stdio ready");
}

async function main(): Promise<void> {
  const mode = process.env.MCP_TRANSPORT ?? "stdio";
  if (mode === "http") {
    await startHttp();
  } else {
    await startStdio();
  }
}

main().catch((err) => {
  console.error("action1-mcp fatal:", err);
  process.exit(1);
});
