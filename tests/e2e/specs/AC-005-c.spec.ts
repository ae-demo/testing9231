// spec: tests/validation/test-plan.md § AC-005-c
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { createCategory } from "../lib/app";

test("AC-005-c: a household member can delete a category", async ({ page }) => {
  const marker = Date.now();
  const categoryName = `DeleteMe-${marker}`;
  // 1. Sign in, create a category
  await login(page);
  await createCategory(page, categoryName, "100");
  await expect(page.getByRole("row", { name: new RegExp(`^${categoryName} `) })).toBeVisible();
  // 2. Delete it, confirm the dialog
  await page.getByRole("row", { name: new RegExp(`^${categoryName} `) }).getByRole("button", { name: "Delete" }).click();
  await page.getByRole("dialog", { name: "Delete category" }).getByRole("button", { name: "Delete" }).click();
  // Assert: it is no longer in the Categories table
  await expect(page.getByRole("row", { name: new RegExp(`^${categoryName} `) })).toHaveCount(0);
});
