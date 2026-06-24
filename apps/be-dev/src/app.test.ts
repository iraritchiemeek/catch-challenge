import { describe, expect, it } from "vitest";
import { app } from "./app.js";

describe("be-dev app", () => {
  it("GET /health returns 200 with status ok", async () => {
    const res = await app.request("/health");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });
});
