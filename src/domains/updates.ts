/**
 * Updates domain — Action1's headline patch-visibility value-prop.
 *
 * Maps PSAction1 Get-Action1 Query 'MissingUpdates'. Single read tool.
 * Patch deployment (write surface) NOT in v1 — financial-commitment-adjacent
 * (a bad deployment can brick endpoints), needs separate Aaron-approval PR.
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { DomainHandler } from "../utils/types.js";
import { getClient } from "../utils/client.js";

const tools: Tool[] = [
  {
    name: "action1_list_missing_updates",
    description:
      "List missing OS / application patches across endpoints in an Action1 organization. " +
      "Returns update id, severity, affected endpoint count, KB/CVE references. " +
      "Use org id from action1_list_organizations.",
    inputSchema: {
      type: "object",
      properties: {
        organization_id: {
          type: "string",
          description:
            "Organization id. Defaults to ACTION1_DEFAULT_ORG_ID from credentials if omitted.",
        },
        limit: {
          type: "number",
          description: "Max results to return (default 100, max 500).",
          minimum: 1,
          maximum: 500,
        },
      },
    },
  },
];

export const updatesHandler: DomainHandler = {
  tools,
  async handle(name, args) {
    const client = getClient();
    if (name === "action1_list_missing_updates") {
      const orgId = (args.organization_id as string | undefined) ?? undefined;
      const limit = (args.limit as number | undefined) ?? 100;
      const updates = await client.listMissingUpdates({ orgId, limit });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ count: updates.length, missing_updates: updates }, null, 2),
          },
        ],
      };
    }
    throw new Error(`Unknown tool: ${name}`);
  },
};
