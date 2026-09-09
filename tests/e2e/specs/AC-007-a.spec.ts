// spec: tests/validation/test-plan.md § AC-007-a
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { createCategory, startAddExpense, fillExpenseForm } from "../lib/app";

test("AC-007-a: each category shows a total that reflects the sum of expenses logged against it", async ({ page }) => {
  const marker = Date.now();
  const categoryName = `Sum-${marker}`;
  const today = new Date().toISOString().slice(0, 10);

  // 1. Sign in, create a fresh category (starts at $0 spent)
  await login(page);
  await createCategory(page, categoryName, "1000");
  await page.getByRole("link", { name: "Categories" }).click();
  await expect(page.getByRole("row", { name: new RegExp(`^${categoryName} `) })).toContainText("$0.00");

  // 2. Log two expenses against it (dated today, so both count this month)
  await startAddExpense(page);
  await fillExpenseForm(page, { amount: "12.5", category: categoryName, date: today });
  await page.getByRole("button", { name: "Save Expense" }).click();
  await startAddExpense(page);
  await fillExpenseForm(page, { amount: "7.5", category: categoryName, date: today });
  await page.getByRole("button", { name: "Save Expense" }).click();

  // Assert: "Spent This Month" equals the sum of the two amounts (20.00)
  await page.getByRole("link", { name: "Categories" }).click();
  await expect(page.getByRole("row", { name: new RegExp(`^${categoryName} `) })).toContainText("$20.00");
});
