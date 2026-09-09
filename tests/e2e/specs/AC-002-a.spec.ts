// spec: tests/validation/test-plan.md § AC-002-a
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { createCategory, startAddExpense, fillExpenseForm } from "../lib/app";

test("AC-002-a: submitting a new expense with amount, category, and date creates it", async ({ page }) => {
  const marker = Date.now();
  const categoryName = `Groceries-${marker}`;
  const note = `note-${marker}`;
  // 1. Sign in
  await login(page);
  // 2. Create a category to log against
  await createCategory(page, categoryName, "200");
  // 3. Add Expense: amount, category, date, note
  await startAddExpense(page);
  await fillExpenseForm(page, {
    amount: "24.5",
    category: categoryName,
    date: "2026-09-05",
    note,
  });
  // 4. Save
  await page.getByRole("button", { name: "Save Expense" }).click();
  // Assert: the expenses list shows the new row
  const row = page.getByRole("row", { name: new RegExp(`2026-09-05.*\\$24\\.50.*${categoryName}`) });
  await expect(row).toBeVisible();
  await expect(row.getByText(note)).toBeVisible();
});
