// spec: tests/validation/test-plan.md § AC-010-a
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { createCategory, startAddExpense, fillExpenseForm } from "../lib/app";

test("AC-010-a: an expense can be created with a currency different from the home currency", async ({ page }) => {
  const marker = Date.now();
  const categoryName = `ForeignCcy-${marker}`;
  const note = `foreign-ccy-note-${marker}`;
  const today = new Date().toISOString().slice(0, 10);

  // 1. Sign in, create a category
  await login(page);
  await createCategory(page, categoryName, "500");

  // 2. Add Expense with currency EUR
  await startAddExpense(page);
  await fillExpenseForm(page, {
    amount: "20",
    currency: "EUR",
    category: categoryName,
    date: today,
    note,
  });
  await page.getByRole("button", { name: "Save Expense" }).click();

  // Assert: the expense is created and shown with its converted home-currency amount.
  // Scoped by this test's own unique note: the shared account accumulates EUR
  // expenses across runs, so a bare /EUR.*\$/ locator matches more than one row.
  const row = page.getByRole("row", { name: new RegExp(note) });
  await expect(row).toBeVisible();
  await expect(row).toHaveText(/EUR.*\$/);
});
