// Shared UI actions for expense-webapp specs.
//
// Always reach nested routes (/expenses/new, /categories/new, /expenses/:id/edit,
// /categories/:id/edit) by clicking through the sidebar/table rather than
// page.goto()'ing them directly: a hard navigation straight to one of those
// paths fails to load the app's runtime env config on this deployment (a
// genuine app issue, not a test artifact — see tests/validation/report.md),
// while the normal click-through flow a user follows works reliably.
import { expect, Page } from "@playwright/test";

export async function createCategory(
  page: Page,
  name: string,
  limit: string,
): Promise<void> {
  await page.getByRole("link", { name: "Categories" }).click();
  await page.getByRole("button", { name: "New Category" }).click();
  await page.getByRole("textbox", { name: "Category Name" }).fill(name);
  await page.getByRole("spinbutton", { name: "Monthly Limit" }).fill(limit);
  await page.getByRole("button", { name: "Save Category" }).click();
}

export async function categoryRow(page: Page, name: string) {
  return page.getByRole("row", { name: new RegExp(`^${escapeRegExp(name)} `) });
}

export async function startAddExpense(page: Page): Promise<void> {
  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.getByRole("button", { name: "Add Expense" }).click();
}

export async function fillExpenseForm(
  page: Page,
  opts: { amount?: string; currency?: string; category?: string; date?: string; note?: string },
): Promise<void> {
  if (opts.amount !== undefined) {
    await page.getByRole("spinbutton", { name: "Amount" }).fill(opts.amount);
  }
  if (opts.currency !== undefined) {
    await page.getByRole("combobox", { name: /Currency/ }).click();
    await page.getByRole("option", { name: opts.currency, exact: true }).click();
  }
  if (opts.category !== undefined) {
    await page.getByRole("combobox", { name: "Category" }).click();
    await page.getByRole("option", { name: opts.category, exact: true }).click();
  }
  if (opts.date !== undefined) {
    await page.getByRole("textbox", { name: "Date" }).fill(opts.date);
  }
  if (opts.note !== undefined) {
    await page.getByRole("textbox", { name: "Note (optional)" }).fill(opts.note);
  }
}

export async function expenseRow(page: Page, amountText: string) {
  return page.getByRole("row", { name: new RegExp(escapeRegExp(amountText)) });
}

// Dashboard "Spending Overview" renders three level-4 headings, in this
// fixed order: Today, This Week, This Month (see specs/design/components/
// expense-webapp/wireframes.dsl). Read by position rather than by nearest
// text label — the label and the amount are visual siblings with no shared
// accessible name, so there is no role-based way to pair them directly.
export async function readDashboardTotals(
  page: Page,
): Promise<{ today: number; week: number; month: number }> {
  await page.getByRole("link", { name: "Dashboard" }).click();
  const headings = page.getByRole("heading", { level: 4 });
  // Each card shows a "…" placeholder before its total finishes loading —
  // wait for the digit to land, not just for the element to exist.
  await expect(headings.first()).toHaveText(/\$/);
  await expect(headings.nth(1)).toHaveText(/\$/);
  await expect(headings.nth(2)).toHaveText(/\$/);
  const [today, week, month] = await headings.allTextContents();
  return { today: parseMoney(today), week: parseMoney(week), month: parseMoney(month) };
}

export function parseMoney(text: string): number {
  return Number(text.replace(/[^0-9.-]/g, ""));
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
