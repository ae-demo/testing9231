// spec: tests/validation/test-plan.md § AC-002-c
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { startAddExpense } from "../lib/app";

test("AC-002-c: submitting an expense without a required field is rejected", async ({ page }) => {
  // 1. Sign in
  await login(page);
  // 2. Open Add Expense
  await startAddExpense(page);
  await expect(page.getByRole("heading", { name: "Add Expense" })).toBeVisible();
  // 3. Click Save with amount, category and date all left empty
  await page.getByRole("button", { name: "Save Expense" }).click();
  // Assert: rejected — still on the Add Expense screen, not navigated to /expenses
  await expect(page.getByRole("heading", { name: "Add Expense" })).toBeVisible();
  await expect(page).not.toHaveURL(/\/expenses$/);
});
