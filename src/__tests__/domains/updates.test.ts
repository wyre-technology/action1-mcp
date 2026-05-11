import { describe, it, expect, vi, beforeEach } from "vitest";
import { updatesHandler } from "../../domains/updates.js";
import * as clientModule from "../../utils/client.js";

describe("updates domain", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("tool registration (pre-flight)", () => {
    it("registers action1_list_missing_updates", () => {
      expect(updatesHandler.tools.map((t) => t.name)).toEqual(["action1_list_missing_updates"]);
    });
  });

  describe("action1_list_missing_updates", () => {
    it("calls client.listMissingUpdates with org + limit and returns count + missing_updates shape", async () => {
      const listMissingUpdates = vi.fn().mockResolvedValue([
        { id: "u1", severity: "critical", kb: "KB5034441" },
        { id: "u2", severity: "important", kb: "KB5034123" },
      ]);
      vi.spyOn(clientModule, "getClient").mockReturnValue({ listMissingUpdates } as never);

      const result = await updatesHandler.handle("action1_list_missing_updates", {
        organization_id: "org-1",
        limit: 50,
      });

      expect(listMissingUpdates).toHaveBeenCalledWith({ orgId: "org-1", limit: 50 });
      const body = JSON.parse(result.content[0].text);
      expect(body.count).toBe(2);
      expect(body.missing_updates).toHaveLength(2);
      expect(body.missing_updates[0].severity).toBe("critical");
    });

    it("defaults limit to 100 when omitted", async () => {
      const listMissingUpdates = vi.fn().mockResolvedValue([]);
      vi.spyOn(clientModule, "getClient").mockReturnValue({ listMissingUpdates } as never);
      await updatesHandler.handle("action1_list_missing_updates", {});
      expect(listMissingUpdates).toHaveBeenCalledWith({ orgId: undefined, limit: 100 });
    });
  });
});
