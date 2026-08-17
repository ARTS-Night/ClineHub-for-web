import { resolve } from "node:path"

process.env.CLINE_DATA_DIR = resolve(process.cwd(), ".cline-data")

const { ClineCore } = await import("@cline/sdk")
const cline = await ClineCore.create({ clientName: "cline-for-web-session-cleanup", backendMode: "local" })

try {
  const sessions = await cline.list(1_000)
  for (const session of sessions) {
    await cline.delete(session.sessionId)
    console.log(`Deleted ${session.sessionId}`)
  }

  const remaining = await cline.list(1_000)
  if (remaining.length > 0) throw new Error(`${remaining.length} sessions remain after cleanup`)
  console.log(`Deleted ${sessions.length} sessions; 0 remain`)
} finally {
  await cline.dispose("Session cleanup complete")
}
