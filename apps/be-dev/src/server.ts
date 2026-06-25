import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { DB_PATH, openDb } from "./import.js";

// Node entrypoint: open the SQLite database and bind the Hono app to a server.
const db = openDb(DB_PATH);
const app = createApp(db);
const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`be-dev listening on http://localhost:${info.port}`);
});
