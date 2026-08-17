import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "node:path"

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  // Vite's lib mode (unlike its app/HTML build) does not auto-replace
  // process.env.NODE_ENV, and browsers have no `process` global — without
  // this define, React/ReactDOM's bundled dev-check code throws immediately
  // on load ("process is not defined") and nothing ever mounts.
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: "public",
    emptyOutDir: false,
    lib: {
      entry: resolve(process.cwd(), "client/main.tsx"),
      formats: ["es"],
      fileName: "app",
    },
  },
})
