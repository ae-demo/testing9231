// Shared helpers for auth, validation, pagination and category-limit status —
// resolved once here rather than re-implemented per resource function.

function unauthorizedError() returns ExpenseError {
    ExpenseError err = {code: 401, message: "unauthorized", description: "missing or invalid token"};
    return err;
}

function notFoundError(string description) returns ExpenseError {
    ExpenseError err = {code: 404, message: "not found", description: description};
    return err;
}

function badRequestError(string description) returns ExpenseError {
    ExpenseError err = {code: 400, message: "invalid input", description: description};
    return err;
}

# Resolves the gateway-injected caller identity. Declared OPTIONAL on the
# resource function so a missing header reaches this resolver — and this
# resolver, not a framework-level required-header rejection — is what answers
# 401 (see the `api-management` skill).
# + userIdHeader - the raw `X-User-Id` header value, or `()` when absent
# + return - the caller id, or the 401 body to send back
function resolveUserId(string? userIdHeader) returns string|ExpenseError {
    if userIdHeader is string && userIdHeader.trim() != "" {
        return userIdHeader;
    }
    return unauthorizedError();
}

function clampLimit(int pageLimit) returns int {
    if pageLimit < 1 {
        return 20;
    }
    if pageLimit > 100 {
        return 100;
    }
    return pageLimit;
}

function clampOffset(int pageOffset) returns int {
    if pageOffset < 0 {
        return 0;
    }
    return pageOffset;
}

function buildPageUri(string basePath, int pageLimit, int pageOffset, map<string> extraParams) returns string {
    string query = "limit=" + pageLimit.toString() + "&offset=" + pageOffset.toString();
    foreach [string, string] [key, value] in extraParams.entries() {
        query = query + "&" + key + "=" + value;
    }
    return basePath + "?" + query;
}

function nextPageUri(string basePath, int pageLimit, int pageOffset, int count, map<string> extraParams)
        returns string? {
    int nextOffset = pageOffset + pageLimit;
    if nextOffset >= count {
        return ();
    }
    return buildPageUri(basePath, pageLimit, nextOffset, extraParams);
}

function previousPageUri(string basePath, int pageLimit, int pageOffset, map<string> extraParams) returns string? {
    if pageOffset <= 0 {
        return ();
    }
    int previousOffset = pageOffset - pageLimit;
    if previousOffset < 0 {
        previousOffset = 0;
    }
    return buildPageUri(basePath, pageLimit, previousOffset, extraParams);
}

final string:RegExp isoDatePattern = re `^[0-9]{4}-[0-9]{2}-[0-9]{2}$`;

function validateExpenseInput(ExpenseInput input) returns ExpenseError? {
    if input.amount <= 0d {
        return badRequestError("amount must be greater than zero");
    }
    if !isoDatePattern.isFullMatch(input.expenseDate) {
        return badRequestError("expenseDate must be in YYYY-MM-DD form");
    }
    if input.categoryId.trim() == "" {
        return badRequestError("categoryId is required");
    }
    string? currency = input?.currency;
    if currency is string && currency.trim() != "" && currency.trim().length() != 3 {
        return badRequestError("currency must be a 3-letter ISO 4217 code");
    }
    return ();
}

function validateCategoryInput(CategoryInput input) returns ExpenseError? {
    if input.name.trim() == "" {
        return badRequestError("name is required");
    }
    if input.limitAmount < 0d {
        return badRequestError("limitAmount must not be negative");
    }
    return ();
}

# Computed status of a category's current-month spend against its limit.
# Exceeded at or above the limit, approaching from 80% of it, ok below that.
# + spent - amount spent this month in the home currency
# + limitAmount - the category's spending limit
# + return - one of `ok`, `approaching`, `exceeded`
function categoryStatusFor(decimal spent, decimal limitAmount) returns string {
    if limitAmount <= 0d {
        return spent > 0d ? "exceeded" : "ok";
    }
    decimal ratio = spent / limitAmount;
    if ratio >= 1.0d {
        return "exceeded";
    }
    if ratio >= 0.8d {
        return "approaching";
    }
    return "ok";
}
