# Validation test plan — testing9231 (Expense Tracker)

Targets: `expense-webapp` (primary, browser specs) and `expense-api` (API
criteria via the `request` fixture). Both resolved from
`tests/e2e/targets.json`.

Auth: single provisioned role, "Household Member", one test user
(`test-household-member`, per the milestone's roles gate ticket). The domain
model gives both real household members the same shared role — there is no
per-person identity distinction in the design beyond `loggedBy`, which is
always this one test account's id. Criteria that say "the other household
member" (AC-003-a, AC-004-a, AC-004-b) are validated with **two independent
browser contexts, each freshly signed in as the same test account** — the
closest automatable proxy to "a different session/device" available given
the project provisions one shared test identity. Every spec logs in fresh
(`lib/auth.ts`); no cached storageState, since a run can outlive the test
token's lifetime.

Known app defect (discovered during exploration, see report): creating an
expense in any non-home currency fails with `403` — `expense-api` forwards
`exchangerate-api`'s own `{"error-type":"plan-upgrade-required"}` response
verbatim. This blocks AC-010-a, AC-011-a, AC-011-b, AC-011-c at the setup
step. Those specs are authored to the criterion's actual `must` regardless —
they fail honestly at expense creation, which is genuine, not brittle.

Known app quirk (not a criterion, noted so specs don't trip on it): a hard
browser navigation straight to a nested route (`/expenses/new`,
`/categories/new`, `/expenses/:id/edit`) fails to load the app (env config
script 404s). Specs always reach those routes by clicking through the UI
(sidebar link, table row action) as a real user would, never via `page.goto`.

## AC-001-a — An unauthenticated visitor cannot view household expense data

- Target: expense-api (request fixture, no auth)
- Steps: 1. `GET /expenses` with no `Authorization` header.
- Assert: response status is `401`.

## AC-001-b — A household member can sign in and reach the application

- Target: expense-webapp
- Steps: 1. Navigate to `/`. 2. Fill Username/Password on the Thunder
  sign-in redirect. 3. Click "Sign In".
- Assert: redirected back to the app; "Spending Overview" heading visible.

## AC-002-a — Submitting a new expense with amount, category, and date creates it

- Target: expense-webapp
- Steps: 1. Sign in. 2. Create a uniquely named category. 3. Add Expense:
  fill amount, category, date, and a note. 4. Save.
- Assert: the expenses list shows a row with the entered date, amount, and
  category.

## AC-002-b — An expense can be created without a note

- Target: expense-webapp
- Steps: 1. Sign in. 2. Create a category. 3. Add Expense: fill amount,
  category, date; leave note blank. 4. Save.
- Assert: the expense is created (row appears in the list) with an empty
  Note cell.

## AC-002-c — Submitting an expense without a required field is rejected

- Target: expense-webapp
- Steps: 1. Sign in. 2. Open Add Expense. 3. Click "Save Expense" with
  amount, category and date all left empty.
- Assert: still on the Add Expense screen (no navigation to `/expenses`) —
  the submission was rejected.

## AC-003-a — An expense logged by one household member appears in the list the other sees

- Target: expense-webapp, two browser contexts
- Steps: 1. Context A signs in, creates a category and logs an expense with
  a unique note. 2. Context B (fresh sign-in) opens the Expenses list.
- Assert: context B's list contains a row with that unique note.

## AC-004-a — A household member can edit an expense logged by the other household member

- Target: expense-webapp, two browser contexts
- Steps: 1. Context A signs in and logs an expense with a unique note.
  2. Context B (fresh sign-in) opens Expenses, edits that expense's amount.
- Assert: context B's edit succeeds and the new amount is shown; re-verified
  in context A's list too.

## AC-004-b — A household member can delete an expense logged by the other household member

- Target: expense-webapp, two browser contexts
- Steps: 1. Context A signs in and logs an expense with a unique note.
  2. Context B (fresh sign-in) deletes that expense from the Expenses list.
- Assert: the row is gone from context B's list.

## AC-005-a — A household member can create a new expense category

- Target: expense-webapp
- Steps: 1. Sign in. 2. Categories → New Category → fill name + limit → Save.
- Assert: the new category appears in the Categories table.

## AC-005-b — A household member can edit an existing category's name

- Target: expense-webapp
- Steps: 1. Sign in, create a category. 2. Edit it, change only the name.
- Assert: the table shows the new name.

## AC-005-c — A household member can delete a category

- Target: expense-webapp
- Steps: 1. Sign in, create a category. 2. Delete it, confirm the dialog.
- Assert: it is no longer in the Categories table.

## AC-006-a — Dashboard "Today" total reflects logged expenses dated today

- Target: expense-webapp
- Steps: 1. Sign in, read the current "Today" total. 2. Create a category,
  log an expense dated today for a known amount. 3. Return to Dashboard.
- Assert: "Today" total increased by exactly that amount (delta check —
  the shared environment may carry expenses from earlier runs).

## AC-006-b — Dashboard "This Week" total reflects logged expenses within that week

- Target: expense-webapp
- Steps: same pattern as AC-006-a, reading/comparing the "This Week" card.
- Assert: "This Week" total increased by exactly the logged amount.

## AC-006-c — Dashboard "This Month" total reflects logged expenses within that month

- Target: expense-webapp
- Steps: same pattern, "This Month" card.
- Assert: "This Month" total increased by exactly the logged amount.

## AC-007-a — Each category shows a total that reflects the sum of expenses logged against it

- Target: expense-webapp
- Steps: 1. Sign in, create a fresh category (starts at $0 spent).
  2. Log two expenses against it with known amounts.
- Assert: Categories table's "Spent This Month" for that category equals the
  sum of the two amounts.

## AC-008-a — A household member can set a limit amount when creating a category

- Target: expense-webapp
- Steps: 1. Sign in, create a category with a specific limit.
- Assert: the Categories table shows that limit for the new category.

## AC-008-b — A household member can change an existing category's limit

- Target: expense-webapp
- Steps: 1. Sign in, create a category. 2. Edit it, change only the limit.
- Assert: the table shows the new limit.

## AC-009-a — A category whose spend is within its limit shows an ok/on-track indicator

- Target: expense-webapp
- Steps: 1. Sign in, create a category with a generous limit. 2. Log an
  expense well under that limit.
- Assert: Categories table shows "On track" for that category.

## AC-009-b — A category whose spend has exceeded its limit shows an exceeded indicator

- Target: expense-webapp
- Steps: 1. Sign in, create a category with a small limit. 2. Log an expense
  that exceeds it.
- Assert: Categories table shows "Exceeded" for that category.

## AC-009-c — manual

No email/SMS/push channel exists in this system to probe automatically;
rendered as a human checklist item in the report.

## AC-010-a — An expense can be created with a currency different from the home currency

- Target: expense-webapp
- Steps: 1. Sign in, create a category. 2. Add Expense with currency EUR.
- Assert: the expense is created and shown with its converted home-currency
  amount. **Known failing**: creation currently returns 403 (see plan intro)
  — asserted anyway, per the criterion's actual `must`.

## AC-010-b — An expense created without specifying a currency defaults to the home currency

- Target: expense-webapp
- Steps: 1. Sign in, create a category. 2. Add Expense leaving currency at
  its default (USD).
- Assert: the expense list row shows the plain USD amount (no foreign-amount
  annotation).

## AC-011-a — A foreign-currency expense shows a converted home-currency amount

- Target: expense-webapp
- Steps: 1. Sign in, create a category. 2. Add Expense in EUR.
- Assert: the expenses list row shows both the original currency amount and
  a converted USD amount. **Known failing** (same defect as AC-010-a).

## AC-011-b — The converted amount uses the exchange rate for the expense's own date, not today's date

- Target: expense-api (request fixture, using a signed-in browser's bearer
  token)
- Steps: 1. Sign in via UI to obtain a valid token. 2. POST an expense dated
  several days in the past, in EUR.
- Assert: response is `201` with a non-null `exchangeRate` and a
  `homeCurrencyAmount` consistent with conversion at that rate — the
  closest automatable check available (no independent historical-FX oracle
  in this environment). **Known failing** (same defect).

## AC-011-c — Daily/weekly/monthly/category totals include the converted home-currency amount

- Target: expense-webapp
- Steps: 1. Sign in, create a fresh category. 2. Log a EUR expense against
  it. 3. Read the category's "Spent This Month" and the Dashboard totals.
- Assert: totals reflect the converted `homeCurrencyAmount`, not the raw
  EUR amount. **Known failing** (same defect — setup step itself fails).
