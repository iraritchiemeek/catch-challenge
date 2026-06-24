import { serve } from "@hono/node-server";
import { app } from "./app.js";

// Node entrypoint: bind the pure Hono app to an HTTP server.
const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`be-dev listening on http://localhost:${info.port}`);
});
