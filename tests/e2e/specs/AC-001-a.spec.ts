// spec: tests/validation/test-plan.md § AC-001-a
import { test, expect } from "@playwright/test";
import { target } from "../lib/targets";

test("AC-001-a: an unauthenticated visitor cannot view household expense data", async ({ request }) => {
  // 1. GET /expenses with no Authorization header
  const res = await request.get(`${target("expense-api")}/expenses`);
  // Assert: rejected as unauthenticated
  expect(res.status()).toBe(401);
});
