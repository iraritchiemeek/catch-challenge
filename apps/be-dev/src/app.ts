import { Hono } from "hono";

// The Hono application. Kept free of server/runtime concerns so it can be
// exercised directly in tests via `app.request(...)`. Challenge features
// (the JSON API, validation, SQLite/Drizzle, the rendered page) are added
// later through the Build Loop.
export const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));
