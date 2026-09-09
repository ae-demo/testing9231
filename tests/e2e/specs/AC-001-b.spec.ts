// spec: tests/validation/test-plan.md § AC-001-b
import { test, expect } from "@playwright/test";
import { login } from "../lib/auth";

test("AC-001-b: a household member can sign in and reach the application", async ({ page }) => {
  // 1-3. Navigate to /, sign in on the Thunder redirect, land back in the app
  await login(page);
  // Assert: the dashboard is reached
  await expect(page.getByRole("heading", { name: "Spending Overview" })).toBeVisible();
  await expect(page).toHaveURL(/\/dashboard$/);
});
