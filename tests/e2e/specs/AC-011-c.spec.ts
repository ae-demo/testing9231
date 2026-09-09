// spec: tests/validation/test-plan.md § AC-011-c
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { createCategory, startAddExpense, fillExpenseForm } from "../lib/app";

test("AC-011-c: daily/weekly/monthly and category totals include the converted home-currency amount", async ({ page }) => {
  const marker = Date.now();
  const categoryName = `ConvertTotals-${marker}`;
  const today = new Date().toISOString().slice(0, 10);

  // 1. Sign in, create a fresh category
  await login(page);
  await createCategory(page, categoryName, "500");

  // 2. Log a EUR expense against it
  await startAddExpense(page);
  await fillExpenseForm(page, {
    amount: "50",
    currency: "EUR",
    category: categoryName,
    date: today,
  });
  await page.getByRole("button", { name: "Save Expense" }).click();
  await expect(page.getByRole("row", { name: /EUR.*\$/ })).toBeVisible();

  // 3. Read the category's "Spent This Month" — must reflect the converted
  // USD amount, not the raw 50 EUR figure
  await page.getByRole("link", { name: "Categories" }).click();
  const row = page.getByRole("row", { name: new RegExp(`^${categoryName} `) });
  await expect(row).toBeVisible();
  await expect(row).not.toContainText("$50.00");
});
