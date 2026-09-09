import ballerina/http;

// Client for the exchangerate-api external dependency
// (specs/design/dependencies/exchangerate-api/openapi.yaml) — historical rate
// lookup only, the one operation this service needs.
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
    map<decimal> rates = response.conversion_rates;
    decimal? rateToUsd = rates["USD"];
    if rateToUsd is decimal {
        return rateToUsd;
    }
    return error("exchangerate-api response missing a USD conversion rate");
}

# Resolves the home-currency (USD) amount and the rate used. USD stays 1:1
# with a null rate; any other currency is converted via the historical rate
# for the expense's own date, never the current date.
# + amount - the amount as paid, in `currency`
# + currency - ISO 4217 code the expense was paid in
# + expenseDate - the expense's own date, in `YYYY-MM-DD` form
# + return - `[homeCurrencyAmount, exchangeRate]`, or an error from the upstream lookup
function resolveHomeCurrencyAmount(decimal amount, string currency, string expenseDate) returns [decimal, decimal?]|error {
    if currency == "USD" {
        return [amount, ()];
    }
    decimal rate = check fetchHistoricalRateToUsd(currency, expenseDate);
    decimal homeAmount = amount * rate;
    return [homeAmount, rate];
}
