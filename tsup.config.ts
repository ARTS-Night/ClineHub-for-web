import { defineConfig } from "tsup"

// Bundles the server (src/server.ts and everything it imports under src/) into a
// single ESM file for distribution, so the release branch can run it with just
// `node dist/server.js` and the runtime deps in node_modules — no tsx, no source.
export default defineConfig({
  entry: { server: "src/server.ts" },
  format: ["esm"],
  target: "node20",
  platform: "node",
  outDir: "dist",
  // dist/ is cleaned by build:client (scripts/build-client.mjs); this step must run
  // after it and not wipe the client assets already sitting there.
  clean: false,
  sourcemap: false,
  dts: false,
  // Lets the packed release's package.json point "bin" straight at this file and
  // run it via `pnpm add -g` / `clinehub-for-web`, no separate wrapper script.
  banner: { js: "#!/usr/bin/env node" },
})
