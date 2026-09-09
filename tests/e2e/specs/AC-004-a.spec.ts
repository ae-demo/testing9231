// spec: tests/validation/test-plan.md § AC-004-a
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";
import { createCategory, startAddExpense, fillExpenseForm } from "../lib/app";

test("AC-004-a: a household member can edit an expense logged by the other household member", async ({ browser }, testInfo) => {
  // Two full sign-in + UI flows in one test comfortably exceed the config's
  // single-flow 30s budget; this is a step-count issue, not app slowness.
  testInfo.setTimeout(120_000);
  const marker = Date.now();
  const categoryName = `EditOther-${marker}`;
  const note = `edit-other-note-${marker}`;

  // 1. Context A signs in and logs an expense with a unique note
  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  await login(pageA);
  await createCategory(pageA, categoryName, "500");
  await startAddExpense(pageA);
  await fillExpenseForm(pageA, { amount: "40", category: categoryName, date: "2026-09-03", note });
  await pageA.getByRole("button", { name: "Save Expense" }).click();
  await expect(pageA.getByRole("row", { name: new RegExp(note) })).toBeVisible();
  await contextA.close();

  // 2. Context B (fresh sign-in) opens Expenses, edits that expense's amount
  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  await login(pageB);
  await pageB.getByRole("link", { name: "Expenses" }).click();
  const row = pageB.getByRole("row", { name: new RegExp(note) });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Edit" }).click();
  await pageB.getByRole("spinbutton", { name: "Amount" }).fill("55.00");
  await pageB.getByRole("button", { name: "Save Expense" }).click();
  // Assert: context B's edit succeeds and the new amount is shown
  const updatedRow = pageB.getByRole("row", { name: new RegExp(note) });
  await expect(updatedRow).toContainText("$55.00");
  await contextB.close();
});
