// spec: tests/validation/test-plan.md § AC-008-a
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { createCategory } from "../lib/app";

test("AC-008-a: a household member can set a limit amount when creating a category", async ({ page }) => {
  const marker = Date.now();
  const categoryName = `Limit-${marker}`;
  // 1. Sign in, create a category with a specific limit
  await login(page);
  await createCategory(page, categoryName, "333");
  // Assert: the Categories table shows that limit for the new category
  await expect(page.getByRole("row", { name: new RegExp(`^${categoryName} `) })).toContainText("$333.00");
});
