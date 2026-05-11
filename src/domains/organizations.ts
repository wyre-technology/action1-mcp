/**
 * Organizations domain — multi-tenant MSP discovery.
 *
 * Maps PSAction1 Get-Action1 Query 'Organizations'. Single tool: list.
 * No get-by-id in v1; org IDs are short + visible in list output.
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { DomainHandler } from "../utils/types.js";
import { getClient } from "../utils/client.js";

const tools: Tool[] = [
  {
    name: "action1_list_organizations",
    description:
      "List all Action1 organizations (tenants) accessible to the configured credentials. " +
      "Use this first when working with multi-tenant data — the returned org IDs are " +
      "required by other tools (list_endpoints, list_policies, list_missing_updates).",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

export const organizationsHandler: DomainHandler = {
  tools,
  async handle(name, _args) {
    const client = getClient();
    if (name === "action1_list_organizations") {
      const orgs = await client.listOrganizations();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ count: orgs.length, organizations: orgs }, null, 2),
          },
        ],
      };
    }
    throw new Error(`Unknown tool: ${name}`);
  },
};
