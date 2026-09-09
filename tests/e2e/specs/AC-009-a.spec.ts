// spec: tests/validation/test-plan.md § AC-009-a
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { createCategory, startAddExpense, fillExpenseForm } from "../lib/app";

test("AC-009-a: a category whose spend is within its limit shows an ok/on-track indicator", async ({ page }) => {
  const marker = Date.now();
  const categoryName = `OnTrack-${marker}`;
  const today = new Date().toISOString().slice(0, 10);

  // 1. Sign in, create a category with a generous limit
  await login(page);
  await createCategory(page, categoryName, "500");
  // 2. Log an expense well under that limit
  await startAddExpense(page);
  await fillExpenseForm(page, { amount: "20", category: categoryName, date: today });
  await page.getByRole("button", { name: "Save Expense" }).click();

  // Assert: Categories table shows "On track" for that category
  await page.getByRole("link", { name: "Categories" }).click();
  await expect(page.getByRole("row", { name: new RegExp(`^${categoryName} `) })).toContainText("On track");
});
