# Log an Expense and See Limit Status

A household member logs an expense, possibly in a foreign currency, and immediately sees the converted amount plus whether its category is nearing or over its limit.

```mermaid
sequenceDiagram
    actor Member as Household Member
    participant expense-webapp
    participant expense-api
    participant frankfurter

    Member->>expense-webapp: sign in
    expense-webapp->>expense-api: create expense (amount, currency, category, date, note)
    alt currency is not home currency
        expense-api->>frankfurter: get rate for currency on expense date
        frankfurter-->>expense-api: exchange rate
        expense-api->>expense-api: compute home-currency amount
    end
    expense-api->>expense-api: recompute category total vs limit
    alt over or near limit
        expense-api-->>expense-webapp: created, limit warning
    else within limit
        expense-api-->>expense-webapp: created, ok
    end
    expense-webapp-->>Member: show expense list + category status
```

