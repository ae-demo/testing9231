// Domain records mirroring specs/design/components/expense-api/openapi.yaml.

public type ExpenseError record {|
    int code;
    string message;
    string description?;
    string moreInfo?;
|};

public type Category record {|
    string id;
    string name;
    decimal limitAmount;
    string? createdBy;
|};

public type CategoryInput record {|
    string name;
    decimal limitAmount;
|};

public type CategoryStatus record {|
    *Category;
    decimal spent;
    string status;
|};

public type CategoriesPage record {|
    int count;
    string? next;
    string? previous;
    CategoryStatus[] data;
|};

public type Expense record {|
    string id;
    decimal amount;
    string currency;
    decimal homeCurrencyAmount;
    decimal? exchangeRate;
    string expenseDate;
    string? note;
    string categoryId;
    string loggedBy;
    string createdAt;
    string updatedAt;
|};

public type ExpenseInput record {|
    decimal amount;
    string currency?;
    string expenseDate;
    string note?;
    string categoryId;
|};

public type ExpensesPage record {|
    int count;
    string? next;
    string? previous;
    Expense[] data;
|};

public type CategoryTotal record {|
    string categoryId;
    string categoryName;
    decimal total;
|};

public type TotalsSummary record {|
    string period;
    decimal total;
    CategoryTotal[] byCategory;
|};

// Category and Expense above are queried straight from the DB: every SQL
// query aliases its columns to these exact field names, so no separate row
// shape is needed. Aggregate-only scalar shapes follow.
type CountRow record {|
    int total;
|};

type SpentRow record {|
    decimal spent;
|};

// exchangerate-api historical-rate response — field names match the wire
// contract exactly (specs/design/dependencies/exchangerate-api/openapi.yaml).
type HistoricalRatesResponse record {|
    string result;
    string base_code;
    int year;
    int month;
    int day;
    map<decimal> conversion_rates;
|};

// exchangerate-api `/latest/{base}` response — used only as a fallback when
// the historical-rate lookup is unavailable (see exchangerate.bal). Open
// record: the live response carries extra fields (documentation,
// time_last_update_*, ...) this service has no use for.
type LatestRatesResponse record {
    string result;
    string base_code;
    map<decimal> conversion_rates;
};
