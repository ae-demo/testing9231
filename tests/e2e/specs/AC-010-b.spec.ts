// spec: tests/validation/test-plan.md § AC-010-b
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { createCategory, startAddExpense, fillExpenseForm } from "../lib/app";

test("AC-010-b: an expense created without specifying a currency defaults to the home currency", async ({ page }) => {
  const marker = Date.now();
  const categoryName = `DefaultCcy-${marker}`;
  const today = new Date().toISOString().slice(0, 10);

  // 1. Sign in, create a category
  await login(page);
  await createCategory(page, categoryName, "500");

  // 2. Add Expense leaving currency at its default (USD)
  await startAddExpense(page);
  await fillExpenseForm(page, { amount: "19.99", category: categoryName, date: today });
  await page.getByRole("button", { name: "Save Expense" }).click();

  // Assert: the expense list row shows the plain USD amount, no foreign-amount annotation
  const row = page.getByRole("row", { name: new RegExp(`${today}.*\\$19\\.99.*${categoryName}`) });
  await expect(row).toBeVisible();
  await expect(row).not.toContainText("EUR");
  await expect(row).not.toContainText("GBP");
});
