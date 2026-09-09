// spec: tests/validation/test-plan.md § AC-006-b
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { createCategory, startAddExpense, fillExpenseForm, readDashboardTotals } from "../lib/app";

test("AC-006-b: dashboard 'This Week' total reflects logged expenses within that week", async ({ page }) => {
  const marker = Date.now();
  const categoryName = `Week-${marker}`;
  const today = new Date().toISOString().slice(0, 10);
  const amount = 9.75;

  // 1. Sign in, read the current "This Week" total
  await login(page);
  const before = await readDashboardTotals(page);

  // 2. Create a category, log an expense dated today (within the current week)
  await createCategory(page, categoryName, "1000");
  await startAddExpense(page);
  await fillExpenseForm(page, { amount: String(amount), category: categoryName, date: today });
  await page.getByRole("button", { name: "Save Expense" }).click();

  // 3. Return to Dashboard
  const after = await readDashboardTotals(page);

  // Assert: "This Week" total increased by exactly the logged amount
  expect(after.week).toBeCloseTo(before.week + amount, 2);
});
