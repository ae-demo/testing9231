import { http, HttpResponse } from "msw";
import type { components } from "../src/generated/expense-api";

type Expense = components["schemas"]["Expense"];
type ExpenseInput = components["schemas"]["ExpenseInput"];
type Category = components["schemas"]["Category"];
type CategoryInput = components["schemas"]["CategoryInput"];
type CategoryStatus = components["schemas"]["CategoryStatus"];

// The signed-in mock user is always "Household Member" — there is only one
// role (security.json coldStartRole) — so this id is the fixed "you" for
// every record this session creates. A second, fixed id stands in for the
// OTHER household member so the Expenses list can show both "You" and
// "Household member" rows, exactly as the wireframe draws "You" / "Wife".
const YOU = "mock-household-member";
const OTHER_MEMBER = "mock-other-member";

// Mock exchange rates against the household's home currency (USD), applied
// only when an expense is paid in something else — the same shape
// expense-api's real ExchangeRate-API integration produces.
const MOCK_RATES: Record<string, number> = { EUR: 1.08, GBP: 1.27, AUD: 0.66, CAD: 0.74, INR: 0.012, LKR: 0.0031, JPY: 0.0067 };

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function convert(amount: number, currency: string): { homeCurrencyAmount: number; exchangeRate: number | null } {
  if (currency === "USD") return { homeCurrencyAmount: amount, exchangeRate: null };
  const rate = MOCK_RATES[currency] ?? 1;
  return { homeCurrencyAmount: Math.round(amount * rate * 100) / 100, exchangeRate: rate };
}

// --- Seed data ------------------------------------------------------------
// Held in module scope, like a real app: a create shows up in the next list,
// a delete removes it, an edit persists — for as long as the page stays open.
// Any full page load re-runs this module and restores this exact seed (msw
// resolves requests in the page's own JS context), which is what makes a
// verification run repeatable.

let categories: Category[] = [
  { id: "cat-groceries", name: "Groceries", limitAmount: 400.0, createdBy: YOU },
  { id: "cat-dining-out", name: "Dining Out", limitAmount: 150.0, createdBy: YOU },
  { id: "cat-transport", name: "Transport", limitAmount: 120.0, createdBy: OTHER_MEMBER },
];

let expenses: Expense[] = [
  {
    id: "exp-1",
    amount: 24.0,
    currency: "USD",
    homeCurrencyAmount: 24.0,
    exchangeRate: null,
    expenseDate: isoDaysAgo(0),
    note: "Weekly shop",
    categoryId: "cat-groceries",
    loggedBy: YOU,
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-2",
    amount: 60.0,
    currency: "USD",
    homeCurrencyAmount: 60.0,
    exchangeRate: null,
    expenseDate: isoDaysAgo(1),
    note: "Anniversary dinner",
    categoryId: "cat-dining-out",
    loggedBy: OTHER_MEMBER,
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-3",
    amount: 15.0,
    currency: "EUR",
    homeCurrencyAmount: 16.2,
    exchangeRate: 1.08,
    expenseDate: isoDaysAgo(2),
    note: "Fuel, paid abroad",
    categoryId: "cat-transport",
    loggedBy: YOU,
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-4",
    amount: 96.0,
    currency: "USD",
    homeCurrencyAmount: 96.0,
    exchangeRate: null,
    expenseDate: isoDaysAgo(3),
    note: "Groceries run",
    categoryId: "cat-groceries",
    loggedBy: OTHER_MEMBER,
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-5",
    amount: 60.0,
    currency: "USD",
    homeCurrencyAmount: 60.0,
    exchangeRate: null,
    expenseDate: isoDaysAgo(4),
    note: "Family dinner",
    categoryId: "cat-dining-out",
    loggedBy: YOU,
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-6",
    amount: 39.8,
    currency: "USD",
    homeCurrencyAmount: 39.8,
    exchangeRate: null,
    expenseDate: isoDaysAgo(5),
    note: "Bus pass",
    categoryId: "cat-transport",
    loggedBy: YOU,
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-7",
    amount: 100.0,
    currency: "USD",
    homeCurrencyAmount: 100.0,
    exchangeRate: null,
    expenseDate: isoDaysAgo(6),
    note: "Bulk shopping",
    categoryId: "cat-groceries",
    loggedBy: YOU,
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-8",
    amount: 60.0,
    currency: "USD",
    homeCurrencyAmount: 60.0,
    exchangeRate: null,
    expenseDate: isoDaysAgo(7),
    note: "Takeout",
    categoryId: "cat-dining-out",
    loggedBy: OTHER_MEMBER,
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-9",
    amount: 34.0,
    currency: "USD",
    homeCurrencyAmount: 34.0,
    exchangeRate: null,
    expenseDate: isoDaysAgo(8),
    note: "Fuel",
    categoryId: "cat-transport",
    loggedBy: OTHER_MEMBER,
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-10",
    amount: 100.0,
    currency: "USD",
    homeCurrencyAmount: 100.0,
    exchangeRate: null,
    expenseDate: isoDaysAgo(8),
    note: "Supermarket",
    categoryId: "cat-groceries",
    loggedBy: OTHER_MEMBER,
    createdAt: new Date().toISOString(),
  },
];

let nextExpenseSeq = expenses.length + 1;
let nextCategorySeq = categories.length + 1;

function startOfMonthIso(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function spentThisMonth(categoryId: string): number {
  const from = startOfMonthIso();
  return round2(
    expenses
      .filter((e) => e.categoryId === categoryId && e.expenseDate >= from)
      .reduce((sum, e) => sum + e.homeCurrencyAmount, 0),
  );
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function statusFor(spent: number, limit: number): CategoryStatus["status"] {
  if (spent > limit) return "exceeded";
  if (limit > 0 && spent >= limit * 0.9) return "approaching";
  return "ok";
}

function categoryStatus(c: Category): CategoryStatus {
  const spent = spentThisMonth(c.id);
  return { ...c, spent, status: statusFor(spent, c.limitAmount) };
}

function periodFrom(period: "daily" | "weekly" | "monthly"): string {
  if (period === "daily") return isoDaysAgo(0);
  if (period === "weekly") return isoDaysAgo(6);
  return startOfMonthIso();
}

export const handlers = [
  // --- /expenses -----------------------------------------------------
  http.get("/api/expenses", ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "20");
    const offset = Number(url.searchParams.get("offset") ?? "0");
    const categoryId = url.searchParams.get("categoryId");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    let filtered = expenses.slice().sort((a, b) => (a.expenseDate < b.expenseDate ? 1 : -1));
    if (categoryId) filtered = filtered.filter((e) => e.categoryId === categoryId);
    if (from) filtered = filtered.filter((e) => e.expenseDate >= from);
    if (to) filtered = filtered.filter((e) => e.expenseDate <= to);

    const page = filtered.slice(offset, offset + limit);
    return HttpResponse.json({
      count: filtered.length,
      next: offset + limit < filtered.length ? String(offset + limit) : null,
      previous: offset > 0 ? String(Math.max(0, offset - limit)) : null,
      data: page,
    });
  }),

  http.post("/api/expenses", async ({ request }) => {
    const input = (await request.json()) as ExpenseInput;
    if (!input?.amount || !input?.expenseDate || !input?.categoryId) {
      return HttpResponse.json({ code: 400, message: "invalid input", description: "amount, expenseDate and categoryId are required" }, { status: 400 });
    }
    const currency = input.currency ?? "USD";
    const { homeCurrencyAmount, exchangeRate } = convert(input.amount, currency);
    const created: Expense = {
      id: `exp-${nextExpenseSeq++}`,
      amount: input.amount,
      currency,
      homeCurrencyAmount,
      exchangeRate,
      expenseDate: input.expenseDate,
      note: input.note,
      categoryId: input.categoryId,
      loggedBy: YOU,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expenses = [created, ...expenses];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.get("/api/expenses/:expenseId", ({ params }) => {
    const expense = expenses.find((e) => e.id === params.expenseId);
    if (!expense) return HttpResponse.json({ code: 404, message: "expense not found" }, { status: 404 });
    return HttpResponse.json(expense);
  }),

  http.put("/api/expenses/:expenseId", async ({ params, request }) => {
    const index = expenses.findIndex((e) => e.id === params.expenseId);
    if (index === -1) return HttpResponse.json({ code: 404, message: "expense not found" }, { status: 404 });
    const input = (await request.json()) as ExpenseInput;
    if (!input?.amount || !input?.expenseDate || !input?.categoryId) {
      return HttpResponse.json({ code: 400, message: "invalid input" }, { status: 400 });
    }
    const currency = input.currency ?? "USD";
    const { homeCurrencyAmount, exchangeRate } = convert(input.amount, currency);
    const updated: Expense = {
      ...expenses[index],
      amount: input.amount,
      currency,
      homeCurrencyAmount,
      exchangeRate,
      expenseDate: input.expenseDate,
      note: input.note,
      categoryId: input.categoryId,
      updatedAt: new Date().toISOString(),
    };
    expenses = [...expenses.slice(0, index), updated, ...expenses.slice(index + 1)];
    return HttpResponse.json(updated);
  }),

  http.delete("/api/expenses/:expenseId", ({ params }) => {
    const before = expenses.length;
    expenses = expenses.filter((e) => e.id !== params.expenseId);
    return before === expenses.length
      ? HttpResponse.json({ code: 404, message: "expense not found" }, { status: 404 })
      : new HttpResponse(null, { status: 204 });
  }),

  // --- /categories -----------------------------------------------------
  http.get("/api/categories", ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "20");
    const offset = Number(url.searchParams.get("offset") ?? "0");
    const withStatus = categories.map(categoryStatus);
    const page = withStatus.slice(offset, offset + limit);
    return HttpResponse.json({
      count: withStatus.length,
      next: offset + limit < withStatus.length ? String(offset + limit) : null,
      previous: offset > 0 ? String(Math.max(0, offset - limit)) : null,
      data: page,
    });
  }),

  http.post("/api/categories", async ({ request }) => {
    const input = (await request.json()) as CategoryInput;
    if (!input?.name || typeof input.limitAmount !== "number") {
      return HttpResponse.json({ code: 400, message: "invalid input", description: "name and limitAmount are required" }, { status: 400 });
    }
    const created: Category = { id: `cat-${nextCategorySeq++}`, name: input.name, limitAmount: input.limitAmount, createdBy: YOU };
    categories = [...categories, created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put("/api/categories/:categoryId", async ({ params, request }) => {
    const index = categories.findIndex((c) => c.id === params.categoryId);
    if (index === -1) return HttpResponse.json({ code: 404, message: "category not found" }, { status: 404 });
    const input = (await request.json()) as CategoryInput;
    if (!input?.name || typeof input.limitAmount !== "number") {
      return HttpResponse.json({ code: 400, message: "invalid input" }, { status: 400 });
    }
    const updated: Category = { ...categories[index], name: input.name, limitAmount: input.limitAmount };
    categories = [...categories.slice(0, index), updated, ...categories.slice(index + 1)];
    return HttpResponse.json(updated);
  }),

  http.delete("/api/categories/:categoryId", ({ params }) => {
    const before = categories.length;
    categories = categories.filter((c) => c.id !== params.categoryId);
    return before === categories.length
      ? HttpResponse.json({ code: 404, message: "category not found" }, { status: 404 })
      : new HttpResponse(null, { status: 204 });
  }),

  // --- /totals -----------------------------------------------------
  http.get("/api/totals", ({ request }) => {
    const url = new URL(request.url);
    const period = url.searchParams.get("period") as "daily" | "weekly" | "monthly" | null;
    if (period !== "daily" && period !== "weekly" && period !== "monthly") {
      return HttpResponse.json({ code: 400, message: "invalid period" }, { status: 400 });
    }
    const from = periodFrom(period);
    const inRange = expenses.filter((e) => e.expenseDate >= from);
    const byCategoryMap = new Map<string, number>();
    for (const e of inRange) {
      byCategoryMap.set(e.categoryId, round2((byCategoryMap.get(e.categoryId) ?? 0) + e.homeCurrencyAmount));
    }
    const byCategory = Array.from(byCategoryMap.entries()).map(([categoryId, total]) => ({
      categoryId,
      categoryName: categories.find((c) => c.id === categoryId)?.name ?? categoryId,
      total,
    }));
    return HttpResponse.json({
      period,
      total: round2(inRange.reduce((sum, e) => sum + e.homeCurrencyAmount, 0)),
      byCategory,
    });
  }),
];
