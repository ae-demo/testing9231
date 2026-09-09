import createClient from "openapi-fetch";
import type { paths, components } from "./generated/expense-api";
import { getAccessToken, signIn } from "./auth";

export type Expense = components["schemas"]["Expense"];
export type ExpenseInput = components["schemas"]["ExpenseInput"];
export type Category = components["schemas"]["Category"];
export type CategoryStatus = components["schemas"]["CategoryStatus"];
export type CategoryInput = components["schemas"]["CategoryInput"];
export type TotalsSummary = components["schemas"]["TotalsSummary"];

const client = createClient<paths>({ baseUrl: "/api" });

// The gateway injects the real X-User-Id from the validated bearer token, and
// nginx strips any client-supplied value before the request leaves this app —
// see nginx/default.conf. The OpenAPI contract still types the header as
// required, so this placeholder only satisfies that type; it is never what
// the backend actually sees.
const USER_ID_PLACEHOLDER = { "X-User-Id": "browser" };

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  if (!token) {
    await signIn();
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

export interface ExpenseListParams {
  limit?: number;
  offset?: number;
  categoryId?: string;
  from?: string;
  to?: string;
}

export async function listExpenses(params: ExpenseListParams = {}) {
  const { data, error, response } = await client.GET("/expenses", {
    params: { query: params, header: USER_ID_PLACEHOLDER },
    headers: await authHeaders(),
  });
  if (response.status === 401) {
    await signIn();
    throw new Error("unauthorized");
  }
  if (error) throw error;
  return data;
}

export async function getExpense(expenseId: string) {
  const { data, error, response } = await client.GET("/expenses/{expenseId}", {
    params: { path: { expenseId }, header: USER_ID_PLACEHOLDER },
    headers: await authHeaders(),
  });
  if (response.status === 401) {
    await signIn();
    throw new Error("unauthorized");
  }
  if (error) throw error;
  return data;
}

export async function createExpense(input: ExpenseInput) {
  const { data, error, response } = await client.POST("/expenses", {
    params: { header: USER_ID_PLACEHOLDER },
    headers: await authHeaders(),
    body: input,
  });
  if (response.status === 401) {
    await signIn();
    throw new Error("unauthorized");
  }
  if (error) throw error;
  return data;
}

export async function updateExpense(expenseId: string, input: ExpenseInput) {
  const { data, error, response } = await client.PUT("/expenses/{expenseId}", {
    params: { path: { expenseId }, header: USER_ID_PLACEHOLDER },
    headers: await authHeaders(),
    body: input,
  });
  if (response.status === 401) {
    await signIn();
    throw new Error("unauthorized");
  }
  if (error) throw error;
  return data;
}

export async function deleteExpense(expenseId: string) {
  const { error, response } = await client.DELETE("/expenses/{expenseId}", {
    params: { path: { expenseId }, header: USER_ID_PLACEHOLDER },
    headers: await authHeaders(),
  });
  if (response.status === 401) {
    await signIn();
    throw new Error("unauthorized");
  }
  if (error) throw error;
}

export interface CategoryListParams {
  limit?: number;
  offset?: number;
}

export async function listCategories(params: CategoryListParams = {}) {
  const { data, error, response } = await client.GET("/categories", {
    params: { query: params, header: USER_ID_PLACEHOLDER },
    headers: await authHeaders(),
  });
  if (response.status === 401) {
    await signIn();
    throw new Error("unauthorized");
  }
  if (error) throw error;
  return data;
}

export async function createCategory(input: CategoryInput) {
  const { data, error, response } = await client.POST("/categories", {
    params: { header: USER_ID_PLACEHOLDER },
    headers: await authHeaders(),
    body: input,
  });
  if (response.status === 401) {
    await signIn();
    throw new Error("unauthorized");
  }
  if (error) throw error;
  return data;
}

export async function updateCategory(categoryId: string, input: CategoryInput) {
  const { data, error, response } = await client.PUT("/categories/{categoryId}", {
    params: { path: { categoryId }, header: USER_ID_PLACEHOLDER },
    headers: await authHeaders(),
    body: input,
  });
  if (response.status === 401) {
    await signIn();
    throw new Error("unauthorized");
  }
  if (error) throw error;
  return data;
}

export async function deleteCategory(categoryId: string) {
  const { error, response } = await client.DELETE("/categories/{categoryId}", {
    params: { path: { categoryId }, header: USER_ID_PLACEHOLDER },
    headers: await authHeaders(),
  });
  if (response.status === 401) {
    await signIn();
    throw new Error("unauthorized");
  }
  if (error) throw error;
}

export async function getTotals(period: "daily" | "weekly" | "monthly") {
  const { data, error, response } = await client.GET("/totals", {
    params: { query: { period }, header: USER_ID_PLACEHOLDER },
    headers: await authHeaders(),
  });
  if (response.status === 401) {
    await signIn();
    throw new Error("unauthorized");
  }
  if (error) throw error;
  return data;
}
