import { spawnSync } from "node:child_process"
import { readdirSync } from "node:fs"
import { resolve } from "node:path"

// Every tests/*.test.ts runs in its own tsx process so one suite's stray global
// state (env vars, temp dirs, a spun-up server) can't leak into the next.
const directory = resolve(process.cwd(), "tests")
const suites = readdirSync(directory).filter((file) => file.endsWith(".test.ts")).sort()

if (suites.length === 0) {
  console.error("No test suites found in tests/")
  process.exit(1)
}

const failed = []
for (const suite of suites) {
  const result = spawnSync("pnpm exec tsx " + JSON.stringify(resolve(directory, suite)), {
    stdio: "inherit",
    shell: true,
  })
  if (result.status !== 0) failed.push(suite)
}

if (failed.length > 0) {
  console.error(`\n${failed.length} of ${suites.length} suites failed: ${failed.join(", ")}`)
  process.exit(1)
}
console.log(`\nall ${suites.length} test suites passed`)
