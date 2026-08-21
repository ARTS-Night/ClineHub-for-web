import { expect, test } from "@playwright/test"

// This environment has no AI provider configured, so specs stop short of
// anything requiring a live model connection (creating a real chat Session,
// then tagging/archiving it). That surface is exercised by the server-side
// integration tests instead (tests/tags.test.ts, tests/auto-chat-api.test.ts).
// What's unique to Playwright here is: does the page actually boot clean,
// does the setup dialog auto-open, and do the new Auto Chat UI/validation
// paths work end-to-end in a real browser.

test("boots cleanly and opens the AI setup dialog when unconfigured", async ({ page }) => {
  const consoleErrors: string[] = []
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()) })
  page.on("pageerror", (error) => consoleErrors.push(String(error)))

  await page.goto("/")
  await expect(page.locator("header")).toBeVisible()
  await expect(page.locator("aside")).toBeVisible()
  // No AI provider configured in this environment -> the setup dialog opens automatically.
  await expect(page.locator("dialog#setup[open]")).toBeVisible()

  expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join("\n")}`).toEqual([])
})

test("Auto Chats dialog opens from the AI settings menu and its create form renders every field", async ({ page }) => {
  // This environment has no Model profile configured (no AI provider was
  // ever connected), and the create form correctly requires one via the
  // browser's own <select required> — so the full create/enable/reject/
  // delete round trip (already covered server-side by
  // tests/auto-chat-api.test.ts) isn't reachable from the UI here. This
  // checks the wiring instead: the dialog opens, and Phase 2's field set —
  // Name/Workspace/Model/Template/MCP-none/Run prompt/Tags/Schedule — is
  // all present, matching the "reuse existing dialog patterns" design goal.
  const consoleErrors: string[] = []
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()) })

  await page.goto("/")
  await page.locator("dialog#setup .icon-button").click()

  await page.locator("#ai-settings-button").click()
  await page.getByRole("button", { name: "Auto Chats", exact: true }).click()
  const dialog = page.locator("dialog#auto-chats-dialog")
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText("No Auto Chats yet.")).toBeVisible()

  await dialog.getByRole("button", { name: "New Auto Chat" }).click()
  await expect(dialog.getByLabel("Name")).toBeVisible()
  await expect(dialog.getByLabel("Workspace profile")).toBeVisible()
  await expect(dialog.getByLabel("Model profile")).toBeVisible()
  await expect(dialog.getByLabel("Template")).toBeVisible()
  await expect(dialog.getByLabel("Run prompt")).toBeVisible()
  await expect(dialog.getByPlaceholder("Add a tag...")).toBeVisible()
  await expect(dialog.getByText("Schedule", { exact: true })).toBeVisible()
  await expect(dialog.getByText(/Server timezone/)).toHaveCount(0) // only shown once a non-manual schedule is picked
  await dialog.locator("select").filter({ hasText: "Manual" }).selectOption("weekly")
  await expect(dialog.getByText(/Server timezone/)).toBeVisible()
  await expect(dialog.getByText("Sun")).toBeVisible() // weekday picker appeared

  expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join("\n")}`).toEqual([])
})
