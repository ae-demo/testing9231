# testing9231 — PRD

## Problem Statement

Tracking household expenses today happens in scattered notes, receipts, or spreadsheets that are tedious to update and give no real-time picture of where money goes. Without an easy way to log spending as it happens and see it broken down by category and time period, it is hard to notice overspending until the bill arrives — and harder still when two people (a couple) are both spending from the same household budget but have no shared view of it.

## Solution

A personal web application for a two-person household to log daily expenses in seconds, categorize them into groups, and see spending totals broken down by day, week, and month. Both members of the household share one view of all expenses, can set a spending limit per category, and can see at a glance when a category is approaching or over its limit.

## Actors

- **Household Member** — either person in the household (the user or their wife). Both have identical permissions: add, edit, and delete any expense; create, edit, and delete expense categories; set or change category limits; and view all household spending and totals.

## User Stories

1. As a household member, I want to sign in securely, so that only my wife and I can access our household's expense data.
2. As a household member, I want to add a daily expense with an amount, category, date, and optional note, so that I can track spending as it happens.
3. As a household member, I want to see the full list of expenses logged by either of us, so that we share one view of household spending.
4. As a household member, I want to edit or delete any expense, regardless of who logged it, so that either of us can correct mistakes.
5. As a household member, I want to create, edit, and delete expense categories, so that the categories match how we actually spend.
6. As a household member, I want to view total expenditures for today, this week, and this month, so that I can understand spending patterns over time.
7. As a household member, I want to see the total spent per category, so that I can understand where the money goes.
8. As a household member, I want to set a spending limit for each category, so that I can control overspending.
9. As a household member, I want to see when a category is approaching or has exceeded its limit, so that I can adjust spending before it gets out of hand.

## Product Decisions

- **Sign-in**: Single sign-on through Thunder, the platform identity provider — every web app on this platform signs users in this way.
- **Household model**: One shared household ledger. Both household members see and can manage every expense, category, and limit — there is no owner/admin distinction and no per-person permission tier.
- **Membership**: The household is fixed to two members (the user and their wife); there is no open sign-up or invite flow for additional members.
- **Limit alerts**: When a category is approaching or has exceeded its limit, this is shown as an in-app visual indicator (e.g. on the category and dashboard views); there is no email, SMS, or push notification.
- **Currency**: The app tracks spending in a single currency; there is no multi-currency support.
- **External services**: None required — this is a self-contained personal finance tracker with no third-party payment, banking, or notification integration.

## Out of Scope

- Multi-currency support or currency conversion.
- Bank account or card integration / automatic transaction import.
- Receipt scanning or OCR.
- Budgeting or reporting across more than one household.
- Native mobile apps (this is a web application).
- Recurring/scheduled expenses and bill reminders.

## Open Questions

None — the household is small (two members) and the answers above cover the app's current scope. Any of the `*assumed*` decisions above can be revisited.

## Further Notes

None.

