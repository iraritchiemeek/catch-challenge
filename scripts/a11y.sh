#!/usr/bin/env bash
# Accessibility scan with @axe-core/cli against the running app.
#
# Run the app first (e.g. `pnpm --filter jamstack dev --port 3100`), then `pnpm a11y`.
# We pass an explicit chromedriver binary because @axe-core/cli bundles its own
# chromedriver version, which may not match the Chrome installed on this machine;
# the `chromedriver` devDependency resolves a binary we can pin to the local Chrome.
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3100}"
DRIVER="$(node -p 'require("chromedriver").path')"

exec npx axe "${BASE_URL}/" "${BASE_URL}/?page=2" \
  --chromedriver-path "${DRIVER}" \
  --exit
