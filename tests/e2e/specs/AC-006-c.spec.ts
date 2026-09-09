// spec: tests/validation/test-plan.md § AC-006-c
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { createCategory, startAddExpense, fillExpenseForm, readDashboardTotals } from "../lib/app";

test("AC-006-c: dashboard 'This Month' total reflects logged expenses within that month", async ({ page }) => {
  const marker = Date.now();
  const categoryName = `Month-${marker}`;
  const today = new Date().toISOString().slice(0, 10);
  const amount = 5.5;

  // 1. Sign in, read the current "This Month" total
  await login(page);
  const before = await readDashboardTotals(page);

  // 2. Create a category, log an expense dated today (within the current month)
  await createCategory(page, categoryName, "1000");
  await startAddExpense(page);
  await fillExpenseForm(page, { amount: String(amount), category: categoryName, date: today });
  await page.getByRole("button", { name: "Save Expense" }).click();

  // 3. Return to Dashboard
  const after = await readDashboardTotals(page);

  // Assert: "This Month" total increased by exactly the logged amount
  expect(after.month).toBeCloseTo(before.month + amount, 2);
});
