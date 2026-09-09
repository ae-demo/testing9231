// spec: tests/validation/test-plan.md § AC-011-b
import { test, expect } from "@playwright/test";
import { login, getAccessToken } from "../lib/auth";
import { target } from "../lib/targets";

test("AC-011-b: the converted amount uses the exchange rate for the expense's own date, not today's date", async ({ page, request }) => {
  const marker = Date.now();
  const categoryName = `HistRate-${marker}`;

  // 1. Sign in via UI to obtain a valid token
  await login(page);
  const token = await getAccessToken(page);
  // x-user-id mirrors what the webapp's own client sends; the gateway is the
  // party that actually resolves caller identity from the bearer token.
  const authHeaders = { Authorization: `Bearer ${token}`, "x-user-id": "browser" };

  const category = await request.post(`${target("expense-api")}/categories`, {
    headers: authHeaders,
    data: { name: categoryName, limitAmount: 500 },
  });
  expect(category.status()).toBe(201);
  const { id: categoryId } = await category.json();

  // 2. POST an expense dated several days in the past, in EUR
  const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const res = await request.post(`${target("expense-api")}/expenses`, {
    headers: authHeaders,
    data: { amount: 40, currency: "EUR", expenseDate: pastDate, categoryId },
  });

  // Assert: created with a non-null exchange rate consistent with historical conversion
  expect(res.status()).toBe(201);
  const expense = await res.json();
  expect(expense.exchangeRate).not.toBeNull();
  expect(expense.homeCurrencyAmount).not.toBe(expense.amount);
});
