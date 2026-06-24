import type { DatabaseSync } from "node:sqlite";
import { Hono } from "hono";
import { getCustomers } from "./customers.js";
import { paginate, parsePagination, ValidationError } from "./pagination.js";

// The Hono app is built by a factory that takes the database as a closure
// dependency (rather than a module-level singleton), so tests can drive it with
// an in-memory database via `app.request(...)`.
export function createApp(db: DatabaseSync): Hono {
  const app = new Hono();

  app.get("/health", (c) => c.json({ status: "ok" }));

  // Paginated customer records. `page`/`pageSize` are validated up front;
  // malformed input is a 400 rather than a surprising default or a crash.
  app.get("/api/customers", (c) => {
    let page: number;
    let pageSize: number;
    try {
      ({ page, pageSize } = parsePagination(c.req.query()));
    } catch (error) {
      if (error instanceof ValidationError) return c.json({ error: error.message }, 400);
      throw error;
    }

    const { data, total } = getCustomers(db, page, pageSize);
    return c.json({ data, ...paginate(total, page, pageSize) });
  });

  return app;
}
