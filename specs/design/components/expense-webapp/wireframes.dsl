screen Dashboard "Household spending overview"
  navbar "Expense Tracker"
  sidebar "Dashboard -> Dashboard | Expenses -> Expenses | Categories -> Categories | Sign out"
  heading "Spending Overview"
  row
    card "Today | $42.50 | 3 expenses"
    card "This Week | $210.00 | 12 expenses"
    card "This Month | $860.00 | 41 expenses"
  heading "By Category"
  table "Category | Spent | Limit | Status"
    row "Groceries | $320.00 | $400.00 | On track"
    row "Dining Out | $180.00 | $150.00 | Over limit"
    row "Transport | $90.00 | $120.00 | On track"
  button "Add Expense" primary -> AddExpense

screen Expenses "All household expenses, either member may edit"
  navbar "Expense Tracker"
  sidebar "Dashboard -> Dashboard | Expenses -> Expenses | Categories -> Categories | Sign out"
  row
    search "Search expenses"
    select "Category"
    right
    button "Add Expense" primary -> AddExpense
  table "Date | Amount | Category | Note | Logged By | Actions"
    row "2026-09-08 | $24.00 | Groceries | Weekly shop | You"
    row "2026-09-07 | $60.00 | Dining Out | Anniversary dinner | Wife"
    row "2026-09-06 | 15.00 EUR ($16.20) | Transport | Fuel, paid abroad | You"

screen AddExpense "Log a new expense"
  navbar "Expense Tracker"
  sidebar "Dashboard -> Dashboard | Expenses -> Expenses | Categories -> Categories | Sign out"
  heading "Add Expense"
  row
    input "Amount"
    select "Currency (default USD)"
  select "Category"
  input "Date"
  textarea "Note (optional)"
  row
    right
    button "Cancel" -> Expenses
    button "Save Expense" primary -> Expenses

screen Categories "Manage categories and their spending limits"
  navbar "Expense Tracker"
  sidebar "Dashboard -> Dashboard | Expenses -> Expenses | Categories -> Categories | Sign out"
  row
    heading "Categories"
    right
    button "New Category" primary -> AddCategory
  table "Category | Limit | Spent This Month | Status"
    row "Groceries | $400.00 | $320.00 | On track"
    row "Dining Out | $150.00 | $180.00 | Exceeded"
    row "Transport | $120.00 | $90.00 | On track"

screen AddCategory "Create or edit a category and its limit"
  navbar "Expense Tracker"
  sidebar "Dashboard -> Dashboard | Expenses -> Expenses | Categories -> Categories | Sign out"
  heading "New Category"
  input "Category Name"
  input "Monthly Limit"
  row
    right
    button "Cancel" -> Categories
    button "Save Category" primary -> Categories

flow "Household expense tracking"
  role "Household Member"
  description "Either household member signs in, logs and reviews shared expenses, and manages categories and limits"
  Dashboard
  Expenses
  AddExpense
  Categories
  AddCategory
