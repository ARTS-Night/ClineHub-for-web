import { spawn } from "node:child_process"

const commands = [
  ["styles", "pnpm exec sass --watch client/styles/main.scss dist/styles.css --no-source-map"],
  ["client", "pnpm exec vite build --watch"],
  ["server", "pnpm exec tsx watch src/server.ts"],
]
// Bind dev server to all interfaces by default (so it's reachable from a
// phone/other device on the LAN), unless the caller already set HOST.
const env = { ...process.env, HOST: process.env.HOST ?? "0.0.0.0" }
const children = commands.map(([label, command]) => {
  // shell:true (as a single command string, not an args array) is required
  // on Windows: recent Node versions refuse to spawn .cmd/.bat files
  // directly (CVE-2024-27980), and passing an args array alongside
  // shell:true triggers a deprecation warning.
  const child = spawn(command, { stdio: "inherit", shell: true, env })
  child.once("exit", (code) => {
    if (code && code !== 0) console.error(`${label} watcher exited with code ${code}`)
  })
  return child
})

function stop(signal) {
  for (const child of children) child.kill(signal)
  process.exitCode = 0
}
process.once("SIGINT", () => stop("SIGINT"))
process.once("SIGTERM", () => stop("SIGTERM"))
