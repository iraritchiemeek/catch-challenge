import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";

// The import "setup script": create the schema and load data/customers.csv into
// SQLite. node:sqlite is built into Node (>=24) — no native build, no external
// service — which is what keeps local setup to a single command.

/** Path to the SQLite database file, overridable via DB_PATH for tests/ops. */
export const DB_PATH = process.env.DB_PATH ?? join(here(), "..", "data", "customers.db");
const CSV_PATH = join(here(), "..", "data", "customers.csv");

// The CSV header order; also the column order of the customers table.
const COLUMNS = [
  "id",
  "first_name",
  "last_name",
  "email",
  "gender",
  "ip_address",
  "company",
  "city",
  "title",
  "website",
] as const;

export function openDb(path: string): DatabaseSync {
  return new DatabaseSync(path);
}

/** Create the customers table if it doesn't exist. Idempotent. */
export function createSchema(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id         INTEGER PRIMARY KEY,
      first_name TEXT,
      last_name  TEXT,
      email      TEXT,
      gender     TEXT,
      ip_address TEXT,
      company    TEXT,
      city       TEXT,
      title      TEXT,
      website    TEXT
    )
  `);
}

/**
 * Parse CSV text and replace the contents of the customers table with it.
 * Returns the number of rows imported. Empty fields become SQL NULL. Runs in a
 * single transaction so a malformed file can't leave a half-loaded table.
 */
export function importCsv(db: DatabaseSync, csv: string): number {
  const rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true }) as Record<
    string,
    string
  >[];

  const insert = db.prepare(
    `INSERT OR REPLACE INTO customers (${COLUMNS.join(", ")})
     VALUES (${COLUMNS.map(() => "?").join(", ")})`,
  );

  db.exec("BEGIN");
  try {
    db.exec("DELETE FROM customers");
    for (const row of rows) {
      // Empty string → NULL; everything else is stored verbatim.
      insert.run(...COLUMNS.map((col) => (row[col] === "" ? null : (row[col] ?? null))));
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return rows.length;
}

function here(): string {
  return dirname(fileURLToPath(import.meta.url));
}

// `pnpm --filter be-dev import` runs this file directly.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const db = openDb(DB_PATH);
  createSchema(db);
  const count = importCsv(db, readFileSync(CSV_PATH, "utf8"));
  db.close();
  console.log(`Imported ${count} customers into ${DB_PATH}`);
}
