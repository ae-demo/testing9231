// spec: tests/validation/test-plan.md § AC-008-b
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { createCategory } from "../lib/app";

test("AC-008-b: a household member can change an existing category's limit", async ({ page }) => {
  const marker = Date.now();
  const categoryName = `ChangeLimit-${marker}`;
  // 1. Sign in, create a category
  await login(page);
  await createCategory(page, categoryName, "100");
  await expect(page.getByRole("row", { name: new RegExp(`^${categoryName} `) })).toContainText("$100.00");
  // 2. Edit it, change only the limit
  await page.getByRole("row", { name: new RegExp(`^${categoryName} `) }).getByRole("button", { name: "Edit" }).click();
  await page.getByRole("spinbutton", { name: "Monthly Limit" }).fill("175");
  await page.getByRole("button", { name: "Save Category" }).click();
  // Assert: the table shows the new limit
  await expect(page.getByRole("row", { name: new RegExp(`^${categoryName} `) })).toContainText("$175.00");
});
