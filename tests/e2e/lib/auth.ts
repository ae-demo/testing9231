// Shared login helper for expense-webapp specs.
//
// The app redirects an unauthenticated visitor to the Thunder IdP's own
// sign-in page (a different origin), so login is a real cross-origin
// redirect flow, not a same-page form. Every spec logs in fresh — no cached
// storageState — since the run may span longer than the test token's
// lifetime and a stale cached session is exactly the kind of brittleness
// the aep-validation healing rules forbid re-baselining around.
import { expect, Page } from "@playwright/test";

export async function login(page: Page): Promise<void> {
  const username = process.env.AEP_E2E_USERNAME;
  const password = process.env.AEP_E2E_PASSWORD;
  if (!username || !password) {
    throw new Error(
      "AEP_E2E_USERNAME / AEP_E2E_PASSWORD not set — cannot sign in as a household member",
    );
  }
  await page.goto("/");
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Spending Overview" })).toBeVisible();
}

// The app stores its OIDC session (react-oidc-context) as a single
// localStorage entry keyed "oidc.user:<issuer>:<client_id>". Extracting the
// access_token lets API-criterion specs authenticate the request fixture the
// same way the browser does, without re-deriving a token via a separate
// grant this IdP may not expose.
export async function getAccessToken(page: Page): Promise<string> {
  const token = await page.evaluate(() => {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith("oidc.user:")) {
        const value = window.localStorage.getItem(key);
        if (value) return JSON.parse(value).access_token as string;
      }
    }
    return null;
  });
  if (!token) throw new Error("no OIDC session found in localStorage after login");
  return token;
}
