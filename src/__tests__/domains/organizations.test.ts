/**
 * Organizations domain tests — FLOOR per playbook (general handler bar).
 *
 * No security-critical surface: list_organizations returns org id + name
 * only, no credential or session data. Four-layer pattern does not apply.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { organizationsHandler } from "../../domains/organizations.js";
import * as clientModule from "../../utils/client.js";

describe("organizations domain", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("tool registration (pre-flight)", () => {
    it("registers action1_list_organizations", () => {
      const names = organizationsHandler.tools.map((t) => t.name);
      expect(names).toEqual(["action1_list_organizations"]);
    });

    it("action1_list_organizations takes no required params", () => {
      const tool = organizationsHandler.tools[0];
      expect(tool.inputSchema.required).toBeUndefined();
    });
  });

  describe("action1_list_organizations", () => {
    it("calls client.listOrganizations and returns count + organizations shape", async () => {
      const listOrganizations = vi.fn().mockResolvedValue([
        { id: "org-1", name: "Acme Corp" },
        { id: "org-2", name: "Globex" },
      ]);
      vi.spyOn(clientModule, "getClient").mockReturnValue({
        listOrganizations,
      } as never);

      const result = await organizationsHandler.handle(
        "action1_list_organizations",
        {},
      );

      expect(listOrganizations).toHaveBeenCalledOnce();
      const body = JSON.parse(result.content[0].text);
      expect(body.count).toBe(2);
      expect(body.organizations).toHaveLength(2);
      expect(body.organizations[0].id).toBe("org-1");
    });

    it("rejects unknown tool names within the domain (negative control)", async () => {
      vi.spyOn(clientModule, "getClient").mockReturnValue({
        listOrganizations: vi.fn(),
      } as never);

      await expect(
        organizationsHandler.handle("action1_not_a_tool", {}),
      ).rejects.toThrow(/Unknown tool/);
    });
  });
});
