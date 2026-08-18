import { spawnSync } from "node:child_process"
import { copyFileSync, mkdirSync, rmSync } from "node:fs"
import { resolve } from "node:path"

// Everything the browser gets is generated into dist/ from client/ sources:
// vite emits app.js and its lazy chunks, sass compiles the stylesheet, and
// index.html is copied verbatim. dist/ is disposable — never edit it.
const dist = resolve(process.cwd(), "dist")

const run = (command) => {
  const result = spawnSync(command, { stdio: "inherit", shell: true })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

// Start clean so renamed lazy chunks don't pile up between builds.
rmSync(dist, { recursive: true, force: true })
mkdirSync(dist, { recursive: true })

run("pnpm exec vite build")
run("pnpm run build:css")
copyFileSync(resolve(process.cwd(), "client/index.html"), resolve(dist, "index.html"))
console.log("copied client/index.html -> dist/index.html")
