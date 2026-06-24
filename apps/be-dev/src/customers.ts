import type { DatabaseSync } from "node:sqlite";

// A customer record as served by the API — every column from the CSV. Empty
// CSV fields are stored as NULL, so the nullable columns are typed accordingly.
export interface Customer {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  gender: string | null;
  ip_address: string | null;
  company: string | null;
  city: string | null;
  title: string | null;
  website: string | null;
}

/**
 * Read one page of customers (ordered by id) plus the total row count. The
 * count rides along so the caller can compute page metadata in one round-trip
 * of intent. Values are bound as parameters, never interpolated, so the input
 * can't reach the SQL text.
 */
export function getCustomers(
  db: DatabaseSync,
  page: number,
  pageSize: number,
): { data: Customer[]; total: number } {
  const offset = (page - 1) * pageSize;
  const data = db
    .prepare("SELECT * FROM customers ORDER BY id LIMIT ? OFFSET ?")
    .all(pageSize, offset) as Customer[];
  const { total } = db.prepare("SELECT count(*) AS total FROM customers").get() as {
    total: number;
  };
  return { data, total };
}
