import { defineConfig } from "@playwright/test"

// Playwright covers the browser-only surface unit/integration tests can't:
// does the page actually boot, does the Sidebar render, do the new dialogs
// (Session Tags, Auto Chats) open and validate. No live AI provider is
// configured in this environment, so specs stick to what's reachable
// without one — see e2e/README.md in this directory for the boundary.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  webServer: {
    // Runs from source (same as `pnpm start`) rather than the tsup bundle,
    // so e2e doesn't need a separate build:server step first.
    command: "pnpm exec tsx src/server.ts",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    env: { PORT: "3100", CLINE_DATA_DIR: "./.cline-data-e2e", CLINEHUB_USER: "", CLINEHUB_PASSWORD: "" },
  },
  use: {
    baseURL: "http://127.0.0.1:3100",
  },
})
