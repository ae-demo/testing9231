// spec: tests/validation/test-plan.md § AC-009-b
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { createCategory, startAddExpense, fillExpenseForm } from "../lib/app";

test("AC-009-b: a category whose spend has exceeded its limit shows an exceeded indicator", async ({ page }) => {
  const marker = Date.now();
  const categoryName = `Exceeded-${marker}`;
  const today = new Date().toISOString().slice(0, 10);

  // 1. Sign in, create a category with a small limit
  await login(page);
  await createCategory(page, categoryName, "10");
  // 2. Log an expense that exceeds it
  await startAddExpense(page);
  await fillExpenseForm(page, { amount: "25", category: categoryName, date: today });
  await page.getByRole("button", { name: "Save Expense" }).click();

  // Assert: Categories table shows "Exceeded" for that category
  await page.getByRole("link", { name: "Categories" }).click();
  await expect(page.getByRole("row", { name: new RegExp(`^${categoryName} `) })).toContainText("Exceeded");
});
