import ballerina/http;
import ballerina/sql;

listener http:Listener expenseListener = new (9090);

service / on expenseListener {

    // ---- expenses ----

    resource function get expenses(@http:Header string? x\-user\-id, int 'limit = 20, int offset = 0,
            string? categoryId = (), string? 'from = (), string? to = ())
            returns ExpensesPage|http:Unauthorized|error {
        string|ExpenseError userIdResult = resolveUserId(x\-user\-id);
        if userIdResult is ExpenseError {
            return <http:Unauthorized>{body: userIdResult};
        }

        int resolvedLimit = clampLimit('limit);
        int resolvedOffset = clampOffset(offset);

        Expense[] expenses = check listExpensesPage(resolvedLimit, resolvedOffset, categoryId, 'from, to);
        int count = check countExpenses(categoryId, 'from, to);

        map<string> extraParams = {};
        if categoryId is string {
            extraParams["categoryId"] = categoryId;
        }
        if 'from is string {
            extraParams["from"] = 'from;
        }
        if to is string {
            extraParams["to"] = to;
        }

        ExpensesPage page = {
            count: count,
            next: nextPageUri("/expenses", resolvedLimit, resolvedOffset, count, extraParams),
            previous: previousPageUri("/expenses", resolvedLimit, resolvedOffset, extraParams),
            data: expenses
        };
        return page;
    }

    resource function post expenses(@http:Header string? x\-user\-id, ExpenseInput payload)
            returns http:Created|http:BadRequest|http:Unauthorized|error {
        string|ExpenseError userIdResult = resolveUserId(x\-user\-id);
        if userIdResult is ExpenseError {
            return <http:Unauthorized>{body: userIdResult};
        }
        string loggedBy = userIdResult;

        ExpenseError? validationError = validateExpenseInput(payload);
        if validationError is ExpenseError {
            return <http:BadRequest>{body: validationError};
        }

        boolean categoryFound = check categoryExists(payload.categoryId);
        if !categoryFound {
            return <http:BadRequest>{body: badRequestError("categoryId does not reference an existing category")};
        }

        string currency = payload?.currency ?: "USD";
        [decimal, decimal?] conversion = check resolveHomeCurrencyAmount(payload.amount, currency,
                payload.expenseDate);
        [decimal, decimal?] [homeCurrencyAmount, exchangeRate] = conversion;

        Expense created = check insertExpense(payload, currency, loggedBy, homeCurrencyAmount, exchangeRate);
        return <http:Created>{body: created};
    }

    resource function get expenses/[string expenseId](@http:Header string? x\-user\-id)
            returns http:Ok|http:NotFound|http:Unauthorized|error {
        string|ExpenseError userIdResult = resolveUserId(x\-user\-id);
        if userIdResult is ExpenseError {
            return <http:Unauthorized>{body: userIdResult};
        }

        Expense|sql:Error result = getExpenseById(expenseId);
        if result is sql:NoRowsError {
            return <http:NotFound>{body: notFoundError("expense not found")};
        }
        if result is error {
            return result;
        }
        return <http:Ok>{body: result};
    }

    resource function put expenses/[string expenseId](@http:Header string? x\-user\-id, ExpenseInput payload)
            returns http:Ok|http:BadRequest|http:NotFound|http:Unauthorized|error {
        string|ExpenseError userIdResult = resolveUserId(x\-user\-id);
        if userIdResult is ExpenseError {
            return <http:Unauthorized>{body: userIdResult};
        }

        ExpenseError? validationError = validateExpenseInput(payload);
        if validationError is ExpenseError {
            return <http:BadRequest>{body: validationError};
        }

        boolean categoryFound = check categoryExists(payload.categoryId);
        if !categoryFound {
            return <http:BadRequest>{body: badRequestError("categoryId does not reference an existing category")};
        }

        string currency = payload?.currency ?: "USD";
        [decimal, decimal?] conversion = check resolveHomeCurrencyAmount(payload.amount, currency,
                payload.expenseDate);
        [decimal, decimal?] [homeCurrencyAmount, exchangeRate] = conversion;

        Expense|error updated = updateExpenseById(expenseId, payload, currency, homeCurrencyAmount, exchangeRate);
        if updated is NotFoundError {
            return <http:NotFound>{body: notFoundError("expense not found")};
        }
        if updated is error {
            return updated;
        }
        return <http:Ok>{body: updated};
    }

    resource function delete expenses/[string expenseId](@http:Header string? x\-user\-id)
            returns http:NoContent|http:NotFound|http:Unauthorized|error {
        string|ExpenseError userIdResult = resolveUserId(x\-user\-id);
        if userIdResult is ExpenseError {
            return <http:Unauthorized>{body: userIdResult};
        }

        error? result = deleteExpenseById(expenseId);
        if result is NotFoundError {
            return <http:NotFound>{body: notFoundError("expense not found")};
        }
        if result is error {
            return result;
        }
        return http:NO_CONTENT;
    }

    // ---- categories ----

    resource function get categories(@http:Header string? x\-user\-id, int 'limit = 20, int offset = 0)
            returns CategoriesPage|http:Unauthorized|error {
        string|ExpenseError userIdResult = resolveUserId(x\-user\-id);
        if userIdResult is ExpenseError {
            return <http:Unauthorized>{body: userIdResult};
        }

        int resolvedLimit = clampLimit('limit);
        int resolvedOffset = clampOffset(offset);

        Category[] categories = check listCategoriesPage(resolvedLimit, resolvedOffset);
        int count = check countCategories();
        DateRange monthRange = check currentMonthRange();

        CategoryStatus[] statuses = [];
        foreach Category category in categories {
            decimal spent = check categorySpentForRange(category.id, monthRange.startDate, monthRange.endDate);
            CategoryStatus withStatus = {
                id: category.id,
                name: category.name,
                limitAmount: category.limitAmount,
                createdBy: category.createdBy,
                spent: spent,
                status: categoryStatusFor(spent, category.limitAmount)
            };
            statuses.push(withStatus);
        }

        CategoriesPage page = {
            count: count,
            next: nextPageUri("/categories", resolvedLimit, resolvedOffset, count, {}),
            previous: previousPageUri("/categories", resolvedLimit, resolvedOffset, {}),
            data: statuses
        };
        return page;
    }

    resource function post categories(@http:Header string? x\-user\-id, CategoryInput payload)
            returns http:Created|http:BadRequest|http:Unauthorized|error {
        string|ExpenseError userIdResult = resolveUserId(x\-user\-id);
        if userIdResult is ExpenseError {
            return <http:Unauthorized>{body: userIdResult};
        }
        string createdBy = userIdResult;

        ExpenseError? validationError = validateCategoryInput(payload);
        if validationError is ExpenseError {
            return <http:BadRequest>{body: validationError};
        }

        Category created = check insertCategory(payload, createdBy);
        return <http:Created>{body: created};
    }

    resource function put categories/[string categoryId](@http:Header string? x\-user\-id, CategoryInput payload)
            returns http:Ok|http:NotFound|http:Unauthorized|error {
        string|ExpenseError userIdResult = resolveUserId(x\-user\-id);
        if userIdResult is ExpenseError {
            return <http:Unauthorized>{body: userIdResult};
        }

        Category|error updated = updateCategoryById(categoryId, payload);
        if updated is NotFoundError {
            return <http:NotFound>{body: notFoundError("category not found")};
        }
        if updated is error {
            return updated;
        }
        return <http:Ok>{body: updated};
    }

    resource function delete categories/[string categoryId](@http:Header string? x\-user\-id)
            returns http:NoContent|http:NotFound|http:Unauthorized|error {
        string|ExpenseError userIdResult = resolveUserId(x\-user\-id);
        if userIdResult is ExpenseError {
            return <http:Unauthorized>{body: userIdResult};
        }

        error? result = deleteCategoryById(categoryId);
        if result is NotFoundError {
            return <http:NotFound>{body: notFoundError("category not found")};
        }
        if result is error {
            return result;
        }
        return http:NO_CONTENT;
    }

    // ---- totals ----

    resource function get totals(@http:Header string? x\-user\-id, string period)
            returns TotalsSummary|http:BadRequest|http:Unauthorized|error {
        string|ExpenseError userIdResult = resolveUserId(x\-user\-id);
        if userIdResult is ExpenseError {
            return <http:Unauthorized>{body: userIdResult};
        }

        DateRange? range = check rangeForPeriod(period);
        if range is () {
            return <http:BadRequest>{body: badRequestError("period must be one of daily, weekly, monthly")};
        }

        decimal total = check totalForRange(range.startDate, range.endDate);
        CategoryTotal[] byCategory = check byCategoryForRange(range.startDate, range.endDate);

        TotalsSummary summary = {period: period, total: total, byCategory: byCategory};
        return summary;
    }
}
