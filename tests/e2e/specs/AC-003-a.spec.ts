// spec: tests/validation/test-plan.md § AC-003-a
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { createCategory, startAddExpense, fillExpenseForm } from "../lib/app";

test("AC-003-a: an expense logged by one household member appears in the list the other sees", async ({ browser }, testInfo) => {
  // Two full sign-in + UI flows in one test comfortably exceed the config's
  // single-flow 30s budget; this is a step-count issue, not app slowness.
  testInfo.setTimeout(120_000);
  const marker = Date.now();
  const categoryName = `Shared-${marker}`;
  const note = `shared-note-${marker}`;

  // 1. Context A signs in, creates a category, logs an expense with a unique note
  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  await login(pageA);
  await createCategory(pageA, categoryName, "500");
  await startAddExpense(pageA);
  await fillExpenseForm(pageA, { amount: "18", category: categoryName, date: "2026-09-04", note });
  await pageA.getByRole("button", { name: "Save Expense" }).click();
  await expect(pageA.getByRole("row", { name: new RegExp(note) })).toBeVisible();
  await contextA.close();

  // 2. Context B (fresh sign-in) opens the Expenses list
  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  await login(pageB);
  await pageB.getByRole("link", { name: "Expenses" }).click();
  // Assert: the expense logged in context A is visible to context B
  await expect(pageB.getByRole("row", { name: new RegExp(note) })).toBeVisible();
  await contextB.close();
});
