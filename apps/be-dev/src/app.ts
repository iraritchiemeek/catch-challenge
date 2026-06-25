import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { Hono } from "hono";
import { getCustomers } from "./customers.js";
import { paginate, parsePagination, ValidationError } from "./pagination.js";

const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

// Read per request (the files are tiny) so a rebuilt stylesheet is picked up
// without a restart.
const STATIC_FILES: Record<string, { file: string; type: string }> = {
  "/": { file: "index.html", type: "text/html; charset=utf-8" },
  "/app.js": { file: "app.js", type: "text/javascript; charset=utf-8" },
  "/render.js": { file: "render.js", type: "text/javascript; charset=utf-8" },
  "/styles.css": { file: "styles.css", type: "text/css; charset=utf-8" },
};

// A factory taking the database as a closure dependency, so tests can drive it
// with an in-memory database via app.request(...).
export function createApp(db: DatabaseSync): Hono {
  const app = new Hono();

  app.get("/health", (c) => c.json({ status: "ok" }));

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

  for (const [path, { file, type }] of Object.entries(STATIC_FILES)) {
    app.get(path, (c) =>
      c.body(readFileSync(join(PUBLIC_DIR, file), "utf8"), 200, { "Content-Type": type }),
    );
  }

  return app;
}
