import ballerina/http;
import ballerina/log;

// Client for the exchangerate-api external dependency
// (specs/design/dependencies/exchangerate-api/openapi.yaml) — historical rate
// lookup is the primary operation; `/latest` is called only as the fallback
// below, since it is not on the pinned contract's slice.
final http:Client exchangeRateClient = check new (resolvedExchangeRateBaseUrl);

function parseIsoDate(string isoDate) returns [int, int, int]|error {
    string[] parts = re `-`.split(isoDate);
    if parts.length() != 3 {
        return error("invalid date: " + isoDate);
    }
    int year = check int:fromString(parts[0]);
    int month = check int:fromString(parts[1]);
    int day = check int:fromString(parts[2]);
    return [year, month, day];
}

function rateToUsdFrom(map<decimal> rates) returns decimal|error {
    decimal? rateToUsd = rates["USD"];
    if rateToUsd is decimal {
        return rateToUsd;
    }
    return error("exchangerate-api response missing a USD conversion rate");
}

# Looks up the historical rate that converts one unit of `currency` into USD on
# `expenseDate`, from the exchangerate-api `/{apiKey}/history/{base}/{year}/{month}/{day}`
# endpoint.
# + currency - ISO 4217 code the expense was paid in
# + expenseDate - the expense's own date, in `YYYY-MM-DD` form
# + return - the conversion rate to USD, or an error when the lookup fails
function fetchHistoricalRateToUsd(string currency, string expenseDate) returns decimal|error {
    [int, int, int] dateParts = check parseIsoDate(expenseDate);
    string path = string `/${exchangeRateApiKey}/history/${currency}/${dateParts[0]}/${dateParts[1]}/${dateParts[2]}`;
    HistoricalRatesResponse response = check exchangeRateClient->get(path);
    return rateToUsdFrom(response.conversion_rates);
}

# Looks up today's rate that converts one unit of `currency` into USD, from
# the exchangerate-api `/{apiKey}/latest/{base}` endpoint. Used only as a
# fallback for `fetchHistoricalRateToUsd` — the historical-data endpoint is a
# paid-tier feature on exchangerate-api, and this account's plan may not carry
# it, so a plan-restricted or otherwise failed historical lookup must not
# leave the expense unconvertible.
# + currency - ISO 4217 code the expense was paid in
# + return - the conversion rate to USD, or an error when the lookup fails
function fetchLatestRateToUsd(string currency) returns decimal|error {
    string path = string `/${exchangeRateApiKey}/latest/${currency}`;
    LatestRatesResponse response = check exchangeRateClient->get(path);
    return rateToUsdFrom(response.conversion_rates);
}

# Resolves the home-currency (USD) amount and the rate used. USD stays 1:1
# with a null rate; any other currency is converted via the historical rate
# for the expense's own date. When that lookup fails — e.g. exchangerate-api
# answers with its "plan-upgrade-required" error because the historical-data
# endpoint needs a paid tier — falls back to today's rate rather than
# forwarding the upstream failure to the caller.
# + amount - the amount as paid, in `currency`
# + currency - ISO 4217 code the expense was paid in
# + expenseDate - the expense's own date, in `YYYY-MM-DD` form
# + return - `[homeCurrencyAmount, exchangeRate]`, or an error when both lookups fail
function resolveHomeCurrencyAmount(decimal amount, string currency, string expenseDate) returns [decimal, decimal?]|error {
    if currency == "USD" {
        return [amount, ()];
    }
    decimal rate;
    decimal|error historicalRate = fetchHistoricalRateToUsd(currency, expenseDate);
    if historicalRate is decimal {
        rate = historicalRate;
    } else {
        log:printWarn("historical rate lookup failed, falling back to today's rate",
                'error = historicalRate, currency = currency, expenseDate = expenseDate);
        rate = check fetchLatestRateToUsd(currency);
    }
    decimal homeAmount = amount * rate;
    return [homeAmount, rate];
}
