import { describe, expect, it } from "vitest";
import { createSchema, importCsv, openDb } from "./import.js";

// A fixture exercising the real-world quirks of data/customers.csv:
// a quoted field containing a comma, empty fields, and unicode.
const FIXTURE_CSV = `id,first_name,last_name,email,gender,ip_address,company,city,title,website
1,Laura,Richards,lrichards0@x.com,Female,81.192.7.99,Meezzy,Kallithéa,"Biostatistician, III",https://intel.com/a.png?x=1&y=2
2,Judy,,judy@x.com,Female,10.0.0.1,,Xiayunling,,https://example.com
`;

function seed() {
  const db = openDb(":memory:");
  createSchema(db);
  return db;
}

describe("createSchema", () => {
  it("creates an empty customers table", () => {
    const db = seed();
    const { c } = db.prepare("SELECT count(*) AS c FROM customers").get() as { c: number };
    expect(c).toBe(0);
  });

  it("is idempotent (safe to run twice)", () => {
    const db = seed();
    expect(() => createSchema(db)).not.toThrow();
  });
});

describe("importCsv", () => {
  it("loads every data row and returns the count", () => {
    const db = seed();
    expect(importCsv(db, FIXTURE_CSV)).toBe(2);
    const { c } = db.prepare("SELECT count(*) AS c FROM customers").get() as { c: number };
    expect(c).toBe(2);
  });

  it("keeps a quoted comma inside a field intact (real CSV parsing, not split)", () => {
    const db = seed();
    importCsv(db, FIXTURE_CSV);
    const row = db.prepare("SELECT title FROM customers WHERE id = 1").get() as { title: string };
    expect(row.title).toBe("Biostatistician, III");
  });

  it("stores empty fields as NULL, not empty strings", () => {
    const db = seed();
    importCsv(db, FIXTURE_CSV);
    const row = db
      .prepare("SELECT last_name, company, title FROM customers WHERE id = 2")
      .get() as { last_name: string | null; company: string | null; title: string | null };
    expect(row).toEqual({ last_name: null, company: null, title: null });
  });

  it("preserves unicode", () => {
    const db = seed();
    importCsv(db, FIXTURE_CSV);
    const row = db.prepare("SELECT city FROM customers WHERE id = 1").get() as { city: string };
    expect(row.city).toBe("Kallithéa");
  });

  it("replaces existing rows so re-running is deterministic", () => {
    const db = seed();
    importCsv(db, FIXTURE_CSV);
    importCsv(db, FIXTURE_CSV);
    const { c } = db.prepare("SELECT count(*) AS c FROM customers").get() as { c: number };
    expect(c).toBe(2);
  });
});
