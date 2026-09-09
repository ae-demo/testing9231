# Validation report

- **Issue:** #7
- **Commit:** b5b12b5011cce87fc72b53637da0cb269697f893
- **Generated:** 2026-09-09T11:32:09.767Z
- **Playwright:** 1.61.1

## Summary

| Method | Total | Pass | Fail | Not run |
|---|---|---|---|---|
| e2e | 24 | 20 | 4 | 0 |
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
| AC-010-a | An expense can be created with a currency different from the home currency | ❌ fail | `tests/e2e/specs/AC-010-a.spec.ts` | — |
| AC-010-b | An expense created without specifying a currency defaults to the home currency | ✅ pass | `tests/e2e/specs/AC-010-b.spec.ts` | — |
| AC-011-a | A foreign-currency expense shows a converted home-currency amount | ❌ fail | `tests/e2e/specs/AC-011-a.spec.ts` | — |
| AC-011-b | The converted amount uses the exchange rate for the expense's own date, not today's date | ❌ fail | `tests/e2e/specs/AC-011-b.spec.ts` | — |
| AC-011-c | Daily, weekly, monthly, and category totals include the converted home-currency amount of a foreign-currency expense, not its original amount | ❌ fail | `tests/e2e/specs/AC-011-c.spec.ts` | — |

## Failures

### AC-010-a — An expense can be created with a currency different from the home currency

Spec: `tests/e2e/specs/AC-010-a.spec.ts`
Location: `AC-010-a.spec.ts:6`

```
Test timeout of 30000ms exceeded.
```

### AC-011-a — A foreign-currency expense shows a converted home-currency amount

Spec: `tests/e2e/specs/AC-011-a.spec.ts`
Location: `AC-011-a.spec.ts:6`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row', { name: /EUR.*\$/ })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('row', { name: /EUR.*\$/ })

```

### AC-011-b — The converted amount uses the exchange rate for the expense's own date, not today's date

Spec: `tests/e2e/specs/AC-011-b.spec.ts`
Location: `AC-011-b.spec.ts:6`

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 201
Received: 403
```

### AC-011-c — Daily, weekly, monthly, and category totals include the converted home-currency amount of a foreign-currency expense, not its original amount

Spec: `tests/e2e/specs/AC-011-c.spec.ts`
Location: `AC-011-c.spec.ts:6`

```
Test timeout of 30000ms exceeded.
```

## Manual checklist

- [ ] **AC-009-c** — The limit indicator is shown in-app only, with no email, SMS, or push notification sent

