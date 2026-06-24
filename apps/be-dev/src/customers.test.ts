import { beforeEach, describe, expect, it } from "vitest";
import { getCustomers } from "./customers.js";
import { createSchema, openDb } from "./import.js";

// Seed a deterministic table of 25 customers (ids 1..25) in memory.
function seed() {
  const db = openDb(":memory:");
  createSchema(db);
  const insert = db.prepare("INSERT INTO customers (id, first_name, email) VALUES (?, ?, ?)");
  for (let id = 1; id <= 25; id++) {
    insert.run(id, `Name${id}`, `name${id}@example.com`);
  }
  return db;
}

describe("getCustomers", () => {
  let db: ReturnType<typeof seed>;
  beforeEach(() => {
    db = seed();
  });

  it("returns the first page in id order with the total count", () => {
    const { data, total } = getCustomers(db, 1, 10);
    expect(total).toBe(25);
    expect(data).toHaveLength(10);
    expect(data.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("offsets to the requested page", () => {
    const { data } = getCustomers(db, 2, 10);
    expect(data.map((c) => c.id)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });

  it("returns a short final page", () => {
    const { data } = getCustomers(db, 3, 10);
    expect(data.map((c) => c.id)).toEqual([21, 22, 23, 24, 25]);
  });

  it("returns no rows for a page past the end (total still reported)", () => {
    const { data, total } = getCustomers(db, 99, 10);
    expect(data).toEqual([]);
    expect(total).toBe(25);
  });
});
