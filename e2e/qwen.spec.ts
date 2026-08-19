import { expect, test } from "@playwright/test";

test("qwen renders as a selectable vendor column", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?left=anthropic&right=qwen");

  await expect(
    page.getByRole("table", { name: /anthropic and qwen/i }),
  ).toBeVisible();

  const headers = page.locator("th.vendor-heading");
  await expect(headers.nth(0)).toContainText("Anthropic");
  await expect(headers.nth(1)).toContainText("Qwen");

  // Qwen has a documented primary coding agent entry
  const codingRow = page.getByRole("row", { name: /primary coding agent/i });
  await expect(codingRow).toBeVisible();
  await expect(codingRow).toContainText("Qwen Code");

  // Qwen is not-documented for the Projects capability (auto-rendered cell)
  const projectsRow = page.getByRole("row", { name: /^Knowledge Work Projects/ });
  await expect(projectsRow).toContainText("Not documented");

  // Vendor comparison view shows Qwen models and plans
  await page.getByRole("button", { name: "Vendor comparison" }).click();
  await expect(
    page.getByRole("heading", { name: /anthropic and qwen vendor comparison/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("strong").filter({ hasText: "Qwen3.8-Max" }),
  ).toBeVisible();
  await expect(
    page.getByRole("strong").filter({ hasText: "QwenCloud Coding Plan" }),
  ).toBeVisible();
});

test("swap button moves Qwen into the left column", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?left=anthropic&right=qwen");

  await page.getByRole("button", { name: "Swap vendors" }).click();

  await expect(page).toHaveURL(/left=qwen&right=anthropic/);
  await expect(
    page.getByRole("table", { name: /qwen and anthropic/i }),
  ).toBeVisible();
});
