import { expect, test } from "@playwright/test";

test("deepseek renders as a selectable vendor column", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?left=anthropic&right=deepseek");

  await expect(
    page.getByRole("table", { name: /anthropic and deepseek/i }),
  ).toBeVisible();

  const headers = page.locator("th.vendor-heading");
  await expect(headers.nth(0)).toContainText("Anthropic");
  await expect(headers.nth(1)).toContainText("DeepSeek");

  // DeepSeek has a documented primary coding agent entry
  const codingRow = page.getByRole("row", { name: /primary coding agent/i });
  await expect(codingRow).toBeVisible();
  await expect(codingRow).toContainText("DeepSeek Harness");

  // DeepSeek is not-documented for the Projects capability (auto-rendered cell)
  const projectsRow = page.getByRole("row", { name: /^Knowledge Work Projects/ });
  await expect(projectsRow).toContainText("Not documented");

  // Vendor comparison view shows DeepSeek models and plans
  await page.getByRole("button", { name: "Vendor comparison" }).click();
  await expect(
    page.getByRole("heading", { name: /anthropic and deepseek vendor comparison/i }),
  ).toBeVisible();
  await expect(page.getByText("DeepSeek-V4-Pro")).toBeVisible();
  await expect(page.getByText("DeepSeek App", { exact: true })).toBeVisible();
});

test("swap button moves DeepSeek into the left column", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?left=anthropic&right=deepseek");

  await page.getByRole("button", { name: "Swap vendors" }).click();

  await expect(page).toHaveURL(/left=deepseek&right=anthropic/);
  await expect(
    page.getByRole("table", { name: /deepseek and anthropic/i }),
  ).toBeVisible();
});
