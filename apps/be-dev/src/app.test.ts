import type { DatabaseSync } from "node:sqlite";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { createSchema, openDb } from "./import.js";

interface ApiBody {
  data: { id: number }[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

function seededApp(rows = 25) {
  const db: DatabaseSync = openDb(":memory:");
  createSchema(db);
  const insert = db.prepare("INSERT INTO customers (id, first_name, email) VALUES (?, ?, ?)");
  for (let id = 1; id <= rows; id++) insert.run(id, `Name${id}`, `name${id}@example.com`);
  return createApp(db);
}

describe("be-dev app", () => {
  it("GET /health returns 200 with status ok", async () => {
    const res = await seededApp().request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });
});

describe("GET /api/customers", () => {
  let app: ReturnType<typeof seededApp>;
  beforeEach(() => {
    app = seededApp(25);
  });

  it("returns the first page with pagination metadata", async () => {
    const res = await app.request("/api/customers?page=1&pageSize=10");
    expect(res.status).toBe(200);
    const body = (await res.json()) as ApiBody;
    expect(body).toMatchObject({
      page: 1,
      pageSize: 10,
      total: 25,
      totalPages: 3,
      hasPrev: false,
      hasNext: true,
    });
    expect(body.data).toHaveLength(10);
    expect(body.data[0]?.id).toBe(1);
  });

  it("serves a different slice for page 2", async () => {
    const res = await app.request("/api/customers?page=2&pageSize=10");
    const body = (await res.json()) as ApiBody;
    expect(body.data[0]?.id).toBe(11);
    expect(body).toMatchObject({ hasPrev: true, hasNext: true });
  });

  it("returns 400 with a JSON error for non-integer input", async () => {
    const res = await app.request("/api/customers?page=abc");
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: expect.stringContaining("page") });
  });

  it("returns an empty page (200) past the end of the data", async () => {
    const res = await app.request("/api/customers?page=99&pageSize=10");
    expect(res.status).toBe(200);
    const body = (await res.json()) as ApiBody;
    expect(body.data).toEqual([]);
    expect(body).toMatchObject({ total: 25, hasNext: false, hasPrev: true });
  });
});
