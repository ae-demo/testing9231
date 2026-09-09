// spec: tests/validation/test-plan.md § AC-005-a
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { createCategory } from "../lib/app";

test("AC-005-a: a household member can create a new expense category", async ({ page }) => {
  const marker = Date.now();
  const categoryName = `NewCat-${marker}`;
  // 1. Sign in
  await login(page);
  // 2. Categories -> New Category -> fill name + limit -> Save
  await createCategory(page, categoryName, "150");
  // Assert: the new category appears in the Categories table
  await expect(page.getByRole("row", { name: new RegExp(`^${categoryName} `) })).toBeVisible();
});
