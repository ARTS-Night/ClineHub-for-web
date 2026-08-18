import { chmodSync, cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

// Assembles the distributable package pushed to the `release` branch: dist/ (built by
// `pnpm run build:pack`) plus a trimmed package.json carrying only the deps the
// bundled server actually needs at runtime. react/mermaid/dompurify/marked etc. are
// client-only — already baked into dist/app.js by vite — so they'd be dead weight
// installed on the server.
const root = process.cwd()
const pack = resolve(root, "pack")
const pkg = JSON.parse(await import("node:fs/promises").then((fs) => fs.readFile(resolve(root, "package.json"), "utf8")))

const SERVER_DEPS = ["@cline/sdk", "@hono/node-server", "@modelcontextprotocol/sdk", "hono", "ssh2"]
const serverDependencies = Object.fromEntries(SERVER_DEPS.map((name) => [name, pkg.dependencies[name]]))

rmSync(pack, { recursive: true, force: true })
mkdirSync(pack, { recursive: true })
cpSync(resolve(root, "dist"), resolve(pack, "dist"), { recursive: true })
// setting/language/*.json is served straight from disk at runtime (src/server.ts's
// serveStatic for /setting/language/*), not bundled into dist/ — without this copy
// the packed server would 404 on every locale, including en/ja.
cpSync(resolve(root, "setting"), resolve(pack, "setting"), { recursive: true })
cpSync(resolve(root, ".env.example"), resolve(pack, ".env.example"))
// ssh2's native crypto binding needs its postinstall to run — carry over the same
// allow-list a fresh `pnpm install` in this standalone package would otherwise skip.
cpSync(resolve(root, "pnpm-workspace.yaml"), resolve(pack, "pnpm-workspace.yaml"))
// The shebang tsup banners onto dist/server.js only makes it runnable — the
// executable bit is what actually lets a package-manager bin symlink invoke it
// directly (Node's own "run this file" path doesn't need it, but `pnpm add -g`'s
// generated shim does). Git preserves this bit once committed from Linux CI.
chmodSync(resolve(pack, "dist", "server.js"), 0o755)

writeFileSync(
  resolve(pack, "package.json"),
  JSON.stringify(
    {
      name: pkg.name,
      version: pkg.version,
      private: false,
      type: "module",
      bin: { "clinehub-for-web": "dist/server.js" },
      scripts: { start: "node dist/server.js" },
      dependencies: serverDependencies,
    },
    null,
    2,
  ) + "\n",
)

writeFileSync(
  resolve(pack, "README.md"),
  `# ${pkg.name} (packed release)\n\nPrebuilt distribution — no source, no dev toolchain.\n\n\`\`\`\npnpm install --prod\npnpm start\n\`\`\`\n\nOr install it globally and run it as a command from anywhere:\n\n\`\`\`\npnpm add -g .\nclinehub-for-web\n\`\`\`\n\nConfigure via \`.env\` (see \`.env.example\`) in whichever directory you run it from.\n`,
)

console.log(`packed release into ${pack}`)
