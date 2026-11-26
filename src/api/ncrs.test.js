import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createNcr, listNcrs, updateNcrStatus } from "./ncrs.js";

describe("ncrs api", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("lists with encoded status and unwraps data envelope", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ data: [{ id: 1 }], statusCode: 200 }),
    });
    const rows = await listNcrs("UNDER_REVIEW");
    expect(rows).toEqual([{ id: 1 }]);
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/ncrs?status=UNDER_REVIEW",
      expect.objectContaining({ headers: {} })
    );
  });

  it("passes abort signal and surfaces structured errors", async () => {
    const controller = new AbortController();
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ message: "bad payload" }),
    });
    await expect(listNcrs("OPEN", { signal: controller.signal })).rejects.toThrow("bad payload");
    expect(fetch.mock.calls[0][1].signal).toBe(controller.signal);

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "boom",
    });
    await expect(createNcr({})).rejects.toThrow("boom");
  });

  it("encodes ids on status updates", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ data: { id: "a/b", status: "CLOSED" } }),
    });
    await updateNcrStatus("a/b", { status: "CLOSED" });
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/ncrs/a%2Fb/status",
      expect.objectContaining({ method: "PUT" })
    );
  });
});
