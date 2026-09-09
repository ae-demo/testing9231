// spec: tests/validation/test-plan.md § AC-004-b
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { createCategory, startAddExpense, fillExpenseForm } from "../lib/app";

test("AC-004-b: a household member can delete an expense logged by the other household member", async ({ browser }, testInfo) => {
  // Two full sign-in + UI flows in one test comfortably exceed the config's
  // single-flow 30s budget; this is a step-count issue, not app slowness.
  testInfo.setTimeout(120_000);
  const marker = Date.now();
  const categoryName = `DeleteOther-${marker}`;
  const note = `delete-other-note-${marker}`;

  // 1. Context A signs in and logs an expense with a unique note
  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  await login(pageA);
  await createCategory(pageA, categoryName, "500");
  await startAddExpense(pageA);
  await fillExpenseForm(pageA, { amount: "33", category: categoryName, date: "2026-09-02", note });
  await pageA.getByRole("button", { name: "Save Expense" }).click();
  await expect(pageA.getByRole("row", { name: new RegExp(note) })).toBeVisible();
  await contextA.close();

  // 2. Context B (fresh sign-in) deletes that expense from the Expenses list
  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  await login(pageB);
  await pageB.getByRole("link", { name: "Expenses" }).click();
  const row = pageB.getByRole("row", { name: new RegExp(note) });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Delete" }).click();
  await pageB.getByRole("dialog", { name: "Delete expense" }).getByRole("button", { name: "Delete" }).click();
  // Assert: the row is gone from context B's list
  await expect(pageB.getByRole("row", { name: new RegExp(note) })).toHaveCount(0);
  await contextB.close();
});
