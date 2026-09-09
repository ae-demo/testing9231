// spec: tests/validation/test-plan.md § AC-006-a
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { createCategory, startAddExpense, fillExpenseForm, readDashboardTotals } from "../lib/app";

test("AC-006-a: dashboard 'Today' total reflects logged expenses dated today", async ({ page }) => {
  const marker = Date.now();
  const categoryName = `Today-${marker}`;
  const today = new Date().toISOString().slice(0, 10);
  const amount = 17.25;

  // 1. Sign in, read the current "Today" total
  await login(page);
  const before = await readDashboardTotals(page);

  // 2. Create a category, log an expense dated today for a known amount
  await createCategory(page, categoryName, "1000");
  await startAddExpense(page);
  await fillExpenseForm(page, { amount: String(amount), category: categoryName, date: today });
  await page.getByRole("button", { name: "Save Expense" }).click();

  // 3. Return to Dashboard
  const after = await readDashboardTotals(page);

  // Assert: "Today" total increased by exactly the logged amount
  expect(after.today).toBeCloseTo(before.today + amount, 2);
});
