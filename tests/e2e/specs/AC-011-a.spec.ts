// spec: tests/validation/test-plan.md § AC-011-a
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { createCategory, startAddExpense, fillExpenseForm } from "../lib/app";

test("AC-011-a: a foreign-currency expense shows a converted home-currency amount", async ({ page }) => {
  const marker = Date.now();
  const categoryName = `Convert-${marker}`;
  const note = `convert-note-${marker}`;
  const today = new Date().toISOString().slice(0, 10);

  // 1. Sign in, create a category
  await login(page);
  await createCategory(page, categoryName, "500");

  // 2. Add Expense in EUR
  await startAddExpense(page);
  await fillExpenseForm(page, {
    amount: "30",
    currency: "EUR",
    category: categoryName,
    date: today,
    note,
  });
  await page.getByRole("button", { name: "Save Expense" }).click();

  // Assert: the list row shows both the original EUR amount and a converted USD amount
  // (per the wireframe format "15.00 EUR ($16.20)"). Scoped by this test's own
  // unique note: the shared account accumulates EUR expenses across runs, so a
  // bare /EUR.*\$/ locator matches more than one row.
  const row = page.getByRole("row", { name: new RegExp(note) });
  await expect(row).toBeVisible();
  await expect(row).toHaveText(/EUR.*\$/);
});
