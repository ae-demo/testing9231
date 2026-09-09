# Domain Model

The household shares one set of expense categories, each with a limit, and expenses that belong to whichever member logged them but are visible to both.

```mermaid
erDiagram
    HOUSEHOLD_MEMBER {
        string id
        string displayName
        string email
    }
    CATEGORY {
        string id
        string name
        decimal limitAmount
        string createdBy
    }
    EXPENSE {
        string id
        decimal amount
        date expenseDate
        string note
        string categoryId
        string loggedBy
        datetime createdAt
        datetime updatedAt
    }

    HOUSEHOLD_MEMBER ||--o{ EXPENSE : "logs"
    HOUSEHOLD_MEMBER ||--o{ CATEGORY : "creates"
    CATEGORY ||--o{ EXPENSE : "classifies"
```

- **HouseholdMember** — resolved from the signed-in identity (Thunder); not a table this service owns, but referenced by `loggedBy`/`createdBy`.
- **Category** — a shared spending group with a `limitAmount`; either member can create, edit, or delete one.
- **Expense** — a single spend entry against a category, editable and deletable by either member regardless of who logged it (`loggedBy`).

