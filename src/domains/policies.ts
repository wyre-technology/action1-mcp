/**
 * Policies domain — automation / policy visibility.
 *
 * Maps PSAction1 Get-Action1 Query 'Policies'. Single read tool.
 * Policy-results / per-policy detail deferred to follow-up.
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { DomainHandler } from "../utils/types.js";
import { getClient } from "../utils/client.js";

const tools: Tool[] = [
  {
    name: "action1_list_policies",
    description:
      "List Action1 policies (automations, deployment rules, remediation policies) in an organization. " +
      "Use org id from action1_list_organizations.",
    inputSchema: {
      type: "object",
      properties: {
        organization_id: {
          type: "string",
          description:
            "Organization id. Defaults to ACTION1_DEFAULT_ORG_ID from credentials if omitted.",
        },
      },
    },
  },
];

export const policiesHandler: DomainHandler = {
  tools,
  async handle(name, args) {
    const client = getClient();
    if (name === "action1_list_policies") {
      const orgId = (args.organization_id as string | undefined) ?? undefined;
      const policies = await client.listPolicies({ orgId });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ count: policies.length, policies }, null, 2),
          },
        ],
      };
    }
    throw new Error(`Unknown tool: ${name}`);
  },
};
