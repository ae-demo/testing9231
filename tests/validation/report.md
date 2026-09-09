# Validation report

- **Issue:** #7
- **Commit:** 9290826a79b0e1248fb133ec3c2aad19f1307f6b
- **Generated:** 2026-09-09T12:17:20.353Z
- **Playwright:** 1.61.1

## Summary

| Method | Total | Pass | Fail | Not run |
|---|---|---|---|---|
| e2e | 24 | 24 | 0 | 0 |
| manual (human checklist) | 1 | — | — | — |
| scenario (not validated) | 0 | — | — | — |

## E2E results

| Criterion | Must | Status | Spec | Notes |
|---|---|---|---|---|
| AC-001-a | An unauthenticated visitor cannot view household expense data | ✅ pass | `tests/e2e/specs/AC-001-a.spec.ts` | — |
| AC-001-b | A household member can sign in and reach the application | ✅ pass | `tests/e2e/specs/AC-001-b.spec.ts` | — |
| AC-002-a | Submitting a new expense with amount, category, and date creates it | ✅ pass | `tests/e2e/specs/AC-002-a.spec.ts` | — |
| AC-002-b | An expense can be created without a note | ✅ pass | `tests/e2e/specs/AC-002-b.spec.ts` | — |
| AC-002-c | Submitting an expense without a required field (amount, category, or date) is rejected | ✅ pass | `tests/e2e/specs/AC-002-c.spec.ts` | — |
| AC-003-a | An expense logged by one household member appears in the list the other household member sees | ✅ pass | `tests/e2e/specs/AC-003-a.spec.ts` | — |
| AC-004-a | A household member can edit an expense logged by the other household member | ✅ pass | `tests/e2e/specs/AC-004-a.spec.ts` | — |
| AC-004-b | A household member can delete an expense logged by the other household member | ✅ pass | `tests/e2e/specs/AC-004-b.spec.ts` | — |
| AC-005-a | A household member can create a new expense category | ✅ pass | `tests/e2e/specs/AC-005-a.spec.ts` | — |
| AC-005-b | A household member can edit an existing category's name | ✅ pass | `tests/e2e/specs/AC-005-b.spec.ts` | — |
| AC-005-c | A household member can delete a category | ✅ pass | `tests/e2e/specs/AC-005-c.spec.ts` | — |
| AC-006-a | The dashboard shows a total for today that reflects logged expenses dated today | ✅ pass | `tests/e2e/specs/AC-006-a.spec.ts` | — |
| AC-006-b | The dashboard shows a total for the current week that reflects logged expenses within that week | ✅ pass | `tests/e2e/specs/AC-006-b.spec.ts` | — |
| AC-006-c | The dashboard shows a total for the current month that reflects logged expenses within that month | ✅ pass | `tests/e2e/specs/AC-006-c.spec.ts` | — |
| AC-007-a | Each category shows a total that reflects the sum of expenses logged against it | ✅ pass | `tests/e2e/specs/AC-007-a.spec.ts` | — |
| AC-008-a | A household member can set a limit amount when creating a category | ✅ pass | `tests/e2e/specs/AC-008-a.spec.ts` | — |
| AC-008-b | A household member can change an existing category's limit | ✅ pass | `tests/e2e/specs/AC-008-b.spec.ts` | — |
| AC-009-a | A category whose spend is within its limit shows an ok/on-track indicator | ✅ pass | `tests/e2e/specs/AC-009-a.spec.ts` | — |
| AC-009-b | A category whose spend has exceeded its limit shows an exceeded indicator | ✅ pass | `tests/e2e/specs/AC-009-b.spec.ts` | — |
| AC-010-a | An expense can be created with a currency different from the home currency | ✅ pass | `tests/e2e/specs/AC-010-a.spec.ts` | healed ×1 |
| AC-010-b | An expense created without specifying a currency defaults to the home currency | ✅ pass | `tests/e2e/specs/AC-010-b.spec.ts` | — |
| AC-011-a | A foreign-currency expense shows a converted home-currency amount | ✅ pass | `tests/e2e/specs/AC-011-a.spec.ts` | healed ×1 |
| AC-011-b | The converted amount uses the exchange rate for the expense's own date, not today's date | ✅ pass | `tests/e2e/specs/AC-011-b.spec.ts` | — |
| AC-011-c | Daily, weekly, monthly, and category totals include the converted home-currency amount of a foreign-currency expense, not its original amount | ✅ pass | `tests/e2e/specs/AC-011-c.spec.ts` | healed ×1 |

## Manual checklist

- [ ] **AC-009-c** — The limit indicator is shown in-app only, with no email, SMS, or push notification sent

## Healing log

| Criterion | Classification | Change | Commit |
|---|---|---|---|
| AC-010-a | data collision | getByRole('row', { name: /EUR.*\$/ }) -> scoped to this run's unique note marker; the shared test account accumulates EUR expense rows across validation runs so the bare EUR/$ locator now matches multiple rows | `9290826a` |
| AC-011-a | data collision | getByRole('row', { name: /EUR.*\$/ }) -> scoped to this run's unique note marker; the shared test account accumulates EUR expense rows across validation runs so the bare EUR/$ locator now matches multiple rows | `9290826a` |
| AC-011-c | data collision | getByRole('row', { name: /EUR.*\$/ }) -> scoped to this run's unique note marker; the shared test account accumulates EUR expense rows across validation runs so the bare EUR/$ locator now matches multiple rows | `9290826a` |

