import ballerina/os;

// Every configurable below reads its platform-injected env var by name, with a
// safe fallback so the service starts with no required environment variables.

// expense-db (platform-resource: postgres-cnpg)
configurable string dbHost = os:getEnv("EXPENSE_DB_HOST");
configurable string dbName = os:getEnv("EXPENSE_DB_DBNAME");
configurable string dbUser = os:getEnv("EXPENSE_DB_USER");
configurable string dbPassword = os:getEnv("EXPENSE_DB_PASSWORD");
configurable string dbPortEnv = os:getEnv("EXPENSE_DB_PORT");

// exchangerate-api (external dependency)
configurable string exchangeRateBaseUrl = os:getEnv("EXCHANGERATE_API_BASE_URL");
configurable string exchangeRateApiKey = os:getEnv("EXCHANGERATE_API_KEY");

# Resolves the configured Postgres port, falling back to the standard default
# when the env var is absent so the service still starts.
# + return - the port to connect on
function resolveDbPort() returns int {
    if dbPortEnv == "" {
        return 5432;
    }
    int|error parsed = int:fromString(dbPortEnv);
    if parsed is int {
        return parsed;
    }
    return 5432;
}

final int dbPort = resolveDbPort();

# Resolves the ExchangeRate-API base URL, falling back to the dependency's own
# documented default (specs/design/dependencies/exchangerate-api/dependency.json)
# when the env var is absent, and trimming a trailing slash so path joins never
# double up.
# + return - the base URL to construct the exchangerate-api client with
function resolveExchangeRateBaseUrl() returns string {
    string baseUrl = exchangeRateBaseUrl == "" ? "https://v6.exchangerate-api.com/v6" : exchangeRateBaseUrl;
    if baseUrl.endsWith("/") {
        return baseUrl.substring(0, baseUrl.length() - 1);
    }
    return baseUrl;
}

final string resolvedExchangeRateBaseUrl = resolveExchangeRateBaseUrl();
