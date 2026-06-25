import type { DatabaseSync } from "node:sqlite";
import { paginate } from "./pagination.js";

// A customer record as served by the API. Empty CSV fields are stored as NULL.
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

// Read one page of customers (ordered by id) plus the total row count. Values are
// bound as parameters, never interpolated into the SQL.
export function getCustomers(
  db: DatabaseSync,
  page: number,
  pageSize: number,
): { data: Customer[]; total: number } {
  const { total } = db.prepare("SELECT count(*) AS total FROM customers").get() as {
    total: number;
  };
  const { offset } = paginate(total, page, pageSize);
  const data = db
    .prepare("SELECT * FROM customers ORDER BY id LIMIT ? OFFSET ?")
    .all(pageSize, offset) as unknown as Customer[];
  return { data, total };
}
