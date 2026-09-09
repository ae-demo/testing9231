// spec: tests/validation/test-plan.md § AC-005-b
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { createCategory } from "../lib/app";

test("AC-005-b: a household member can edit an existing category's name", async ({ page }) => {
  const marker = Date.now();
  const originalName = `RenameMe-${marker}`;
  const newName = `Renamed-${marker}`;
  // 1. Sign in, create a category
  await login(page);
  await createCategory(page, originalName, "100");
  // 2. Edit it, change only the name
  await page.getByRole("row", { name: new RegExp(`^${originalName} `) }).getByRole("button", { name: "Edit" }).click();
  await page.getByRole("textbox", { name: "Category Name" }).fill(newName);
  await page.getByRole("button", { name: "Save Category" }).click();
  // Assert: the table shows the new name
  await expect(page.getByRole("row", { name: new RegExp(`^${newName} `) })).toBeVisible();
  await expect(page.getByRole("row", { name: new RegExp(`^${originalName} `) })).toHaveCount(0);
});
