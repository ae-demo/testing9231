import ballerina/sql;
import ballerina/time;
import ballerina/uuid;
import ballerinax/postgresql;
import ballerinax/postgresql.driver as _;

// Raised when an update/delete matched zero rows — mapped to 404 by the service.
type NotFoundError distinct error;

final postgresql:Client dbClient = check new (
    host = dbHost,
    username = dbUser,
    password = dbPassword,
    database = dbName,
    port = dbPort
);

function initDb() returns error? {
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            limit_amount NUMERIC NOT NULL,
            created_by TEXT
        )
    `);
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS expenses (
            id TEXT PRIMARY KEY,
            amount NUMERIC NOT NULL,
            currency TEXT NOT NULL,
            home_currency_amount NUMERIC NOT NULL,
            exchange_rate NUMERIC,
            expense_date TEXT NOT NULL,
            note TEXT,
            category_id TEXT NOT NULL,
            logged_by TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    `);
}

final () dbReady = check initDb();

function nowIso() returns string {
    return time:utcToString(time:utcNow());
}

// ---- categories ----

function insertCategory(CategoryInput input, string? createdBy) returns Category|error {
    string id = uuid:createRandomUuid();
    _ = check dbClient->execute(`
        INSERT INTO categories (id, name, limit_amount, created_by)
        VALUES (${id}, ${input.name}, ${input.limitAmount}, ${createdBy})
    `);
    Category category = {id: id, name: input.name, limitAmount: input.limitAmount, createdBy: createdBy};
    return category;
}

function getCategoryById(string id) returns Category|sql:Error {
    Category category = check dbClient->queryRow(`
        SELECT id, name, limit_amount AS "limitAmount", created_by AS "createdBy"
        FROM categories WHERE id = ${id}
    `);
    return category;
}

function categoryExists(string id) returns boolean|error {
    Category|sql:Error result = getCategoryById(id);
    if result is Category {
        return true;
    }
    if result is sql:NoRowsError {
        return false;
    }
    return result;
}

function listCategoriesPage(int 'limit, int offset) returns Category[]|error {
    stream<Category, sql:Error?> resultStream = dbClient->query(`
        SELECT id, name, limit_amount AS "limitAmount", created_by AS "createdBy"
        FROM categories ORDER BY name ASC LIMIT ${'limit} OFFSET ${offset}
    `);
    Category[] categories = [];
    check from Category category in resultStream
        do {
            categories.push(category);
        };
    return categories;
}

function countCategories() returns int|error {
    CountRow row = check dbClient->queryRow(`SELECT COUNT(*)::INT AS total FROM categories`);
    return row.total;
}

function updateCategoryById(string id, CategoryInput input) returns Category|error {
    sql:ExecutionResult result = check dbClient->execute(`
        UPDATE categories SET name = ${input.name}, limit_amount = ${input.limitAmount}
        WHERE id = ${id}
    `);
    int? affectedRowCount = result.affectedRowCount;
    if affectedRowCount is int && affectedRowCount == 0 {
        return error NotFoundError("category not found");
    }
    return getCategoryById(id);
}

function deleteCategoryById(string id) returns error? {
    sql:ExecutionResult result = check dbClient->execute(`DELETE FROM categories WHERE id = ${id}`);
    int? affectedRowCount = result.affectedRowCount;
    if affectedRowCount is int && affectedRowCount == 0 {
        return error NotFoundError("category not found");
    }
}

// ---- expenses ----

function insertExpense(ExpenseInput input, string currency, string loggedBy, decimal homeCurrencyAmount,
        decimal? exchangeRate) returns Expense|error {
    string id = uuid:createRandomUuid();
    string timestamp = nowIso();
    string? note = input?.note;
    _ = check dbClient->execute(`
        INSERT INTO expenses (id, amount, currency, home_currency_amount, exchange_rate, expense_date, note,
            category_id, logged_by, created_at, updated_at)
        VALUES (${id}, ${input.amount}, ${currency}, ${homeCurrencyAmount}, ${exchangeRate}, ${input.expenseDate},
            ${note}, ${input.categoryId}, ${loggedBy}, ${timestamp}, ${timestamp})
    `);
    return getExpenseById(id);
}

function getExpenseById(string id) returns Expense|sql:Error {
    Expense expense = check dbClient->queryRow(`
        SELECT id, amount, currency, home_currency_amount AS "homeCurrencyAmount",
            exchange_rate AS "exchangeRate", expense_date AS "expenseDate", note,
            category_id AS "categoryId", logged_by AS "loggedBy",
            created_at AS "createdAt", updated_at AS "updatedAt"
        FROM expenses WHERE id = ${id}
    `);
    return expense;
}

function listExpensesPage(int 'limit, int offset, string? categoryId, string? fromDate, string? toDate)
        returns Expense[]|error {
    sql:ParameterizedQuery query = `
        SELECT id, amount, currency, home_currency_amount AS "homeCurrencyAmount",
            exchange_rate AS "exchangeRate", expense_date AS "expenseDate", note,
            category_id AS "categoryId", logged_by AS "loggedBy",
            created_at AS "createdAt", updated_at AS "updatedAt"
        FROM expenses WHERE 1 = 1`;
    if categoryId is string {
        query = sql:queryConcat(query, ` AND category_id = ${categoryId}`);
    }
    if fromDate is string {
        query = sql:queryConcat(query, ` AND expense_date >= ${fromDate}`);
    }
    if toDate is string {
        query = sql:queryConcat(query, ` AND expense_date <= ${toDate}`);
    }
    query = sql:queryConcat(query, ` ORDER BY expense_date DESC, created_at DESC LIMIT ${'limit} OFFSET ${offset}`);
    stream<Expense, sql:Error?> resultStream = dbClient->query(query);
    Expense[] expenses = [];
    check from Expense expense in resultStream
        do {
            expenses.push(expense);
        };
    return expenses;
}

function countExpenses(string? categoryId, string? fromDate, string? toDate) returns int|error {
    sql:ParameterizedQuery query = `SELECT COUNT(*)::INT AS total FROM expenses WHERE 1 = 1`;
    if categoryId is string {
        query = sql:queryConcat(query, ` AND category_id = ${categoryId}`);
    }
    if fromDate is string {
        query = sql:queryConcat(query, ` AND expense_date >= ${fromDate}`);
    }
    if toDate is string {
        query = sql:queryConcat(query, ` AND expense_date <= ${toDate}`);
    }
    CountRow row = check dbClient->queryRow(query);
    return row.total;
}

function updateExpenseById(string id, ExpenseInput input, string currency, decimal homeCurrencyAmount,
        decimal? exchangeRate) returns Expense|error {
    string timestamp = nowIso();
    string? note = input?.note;
    sql:ExecutionResult result = check dbClient->execute(`
        UPDATE expenses SET amount = ${input.amount}, currency = ${currency},
            home_currency_amount = ${homeCurrencyAmount}, exchange_rate = ${exchangeRate},
            expense_date = ${input.expenseDate}, note = ${note}, category_id = ${input.categoryId},
            updated_at = ${timestamp}
        WHERE id = ${id}
    `);
    int? affectedRowCount = result.affectedRowCount;
    if affectedRowCount is int && affectedRowCount == 0 {
        return error NotFoundError("expense not found");
    }
    return getExpenseById(id);
}

function deleteExpenseById(string id) returns error? {
    sql:ExecutionResult result = check dbClient->execute(`DELETE FROM expenses WHERE id = ${id}`);
    int? affectedRowCount = result.affectedRowCount;
    if affectedRowCount is int && affectedRowCount == 0 {
        return error NotFoundError("expense not found");
    }
}

// ---- totals ----

function totalForRange(string startDate, string endDate) returns decimal|error {
    SpentRow row = check dbClient->queryRow(`
        SELECT COALESCE(SUM(home_currency_amount), 0)::NUMERIC AS spent
        FROM expenses WHERE expense_date >= ${startDate} AND expense_date <= ${endDate}
    `);
    return row.spent;
}

function byCategoryForRange(string startDate, string endDate) returns CategoryTotal[]|error {
    stream<CategoryTotal, sql:Error?> resultStream = dbClient->query(`
        SELECT e.category_id AS "categoryId", c.name AS "categoryName",
            SUM(e.home_currency_amount)::NUMERIC AS total
        FROM expenses e
        JOIN categories c ON c.id = e.category_id
        WHERE e.expense_date >= ${startDate} AND e.expense_date <= ${endDate}
        GROUP BY e.category_id, c.name
        ORDER BY total DESC
    `);
    CategoryTotal[] totals = [];
    check from CategoryTotal total in resultStream
        do {
            totals.push(total);
        };
    return totals;
}

function categorySpentForRange(string categoryId, string startDate, string endDate) returns decimal|error {
    SpentRow row = check dbClient->queryRow(`
        SELECT COALESCE(SUM(home_currency_amount), 0)::NUMERIC AS spent
        FROM expenses
        WHERE category_id = ${categoryId} AND expense_date >= ${startDate} AND expense_date <= ${endDate}
    `);
    return row.spent;
}
