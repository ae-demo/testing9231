// spec: tests/validation/test-plan.md § AC-002-b
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { createCategory, startAddExpense, fillExpenseForm } from "../lib/app";

test("AC-002-b: an expense can be created without a note", async ({ page }) => {
  const marker = Date.now();
  const categoryName = `NoNote-${marker}`;
  // 1. Sign in
  await login(page);
  // 2. Create a category
  await createCategory(page, categoryName, "200");
  // 3. Add Expense: amount, category, date; leave note blank
  await startAddExpense(page);
  await fillExpenseForm(page, { amount: "12.34", category: categoryName, date: "2026-09-06" });
  // 4. Save
  await page.getByRole("button", { name: "Save Expense" }).click();
  // Assert: the row is created with an empty Note cell
  const row = page.getByRole("row", { name: new RegExp(`2026-09-06.*\\$12\\.34.*${categoryName}`) });
  await expect(row).toBeVisible();
  await expect(row.getByRole("cell").nth(3)).toHaveText("");
});
