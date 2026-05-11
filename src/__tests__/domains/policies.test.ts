import { describe, it, expect, vi, beforeEach } from "vitest";
import { policiesHandler } from "../../domains/policies.js";
import * as clientModule from "../../utils/client.js";

describe("policies domain", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("tool registration (pre-flight)", () => {
    it("registers action1_list_policies", () => {
      expect(policiesHandler.tools.map((t) => t.name)).toEqual(["action1_list_policies"]);
    });
  });

  describe("action1_list_policies", () => {
    it("calls client.listPolicies with org scope and returns count + policies shape", async () => {
      const listPolicies = vi
        .fn()
        .mockResolvedValue([{ id: "p1", name: "Patch Tuesday" }, { id: "p2", name: "Reboot Daily" }]);
      vi.spyOn(clientModule, "getClient").mockReturnValue({ listPolicies } as never);

      const result = await policiesHandler.handle("action1_list_policies", {
        organization_id: "org-1",
      });

      expect(listPolicies).toHaveBeenCalledWith({ orgId: "org-1" });
      const body = JSON.parse(result.content[0].text);
      expect(body.count).toBe(2);
      expect(body.policies).toHaveLength(2);
    });

    it("rejects unknown tool names within the domain (negative control)", async () => {
      vi.spyOn(clientModule, "getClient").mockReturnValue({ listPolicies: vi.fn() } as never);
      await expect(policiesHandler.handle("action1_unknown", {})).rejects.toThrow(/Unknown tool/);
    });
  });
});
