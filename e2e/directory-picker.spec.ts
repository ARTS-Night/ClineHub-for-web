import { expect, test } from "@playwright/test"

// Regression test for: selecting a folder in the Browse dialog (opened from
// inside AgentSettingsDialog / ProfilesDialog, both already-open <dialog>
// elements) used to also force-close the ancestor dialog — a nested-<dialog>
// browser quirk fixed by rendering DirectoryPicker through a portal to
// document.body instead of as a DOM descendant of the parent dialog.
test("selecting a folder fills the path and keeps the parent dialog open", async ({ page }) => {
  await page.goto("/")
  await page.locator("dialog#setup .icon-button").click()
  await page.locator("#ai-settings-button").click()
  await page.getByRole("button", { name: "Agent settings", exact: true }).click()
  const dialog = page.locator("dialog.wide-dialog.react-agent-dialog")
  await expect(dialog).toBeVisible()

  await dialog.getByRole("button", { name: "Browse…" }).click()
  const picker = page.locator("dialog.wide-dialog").filter({ hasText: "Choose a folder" })
  await expect(picker).toBeVisible()

  await picker.getByRole("button", { name: /^📁 client$/ }).click()
  await picker.getByRole("button", { name: "Select this folder" }).click()

  // The parent dialog must still be open, and its input must reflect the
  // newly selected path — this is exactly what silently broke before.
  await expect(dialog).toBeVisible()
  await expect(dialog.locator("label", { hasText: "Workspace" }).locator("input")).toHaveValue(/client$/)
})

test("typing a path and pressing Go navigates directly", async ({ page }) => {
  await page.goto("/")
  await page.locator("dialog#setup .icon-button").click()
  await page.locator("#ai-settings-button").click()
  await page.getByRole("button", { name: "Agent settings", exact: true }).click()
  const dialog = page.locator("dialog.wide-dialog.react-agent-dialog")
  await dialog.getByRole("button", { name: "Browse…" }).click()
  const picker = page.locator("dialog.wide-dialog").filter({ hasText: "Choose a folder" })
  await expect(picker).toBeVisible()

  const pathInput = picker.locator("form input[type='text']")
  await pathInput.fill("E:\\cline-for-web\\src")
  await picker.getByRole("button", { name: "Go" }).click()
  await expect(picker.getByRole("button", { name: /^📁 stores$/ })).toBeVisible()
})
