import { useEffect, useState, type FormEvent, type JSX } from "react";
import { useNavigate, useParams } from "react-router";
import { Box, Button, Form, MenuItem, PageContent, PageTitle, Stack, TextField } from "@wso2/oxygen-ui";
import { createExpense, getExpense, listCategories, updateExpense, type Category } from "../api";
import { today } from "../format";

const CURRENCIES = ["USD", "EUR", "GBP", "AUD", "CAD", "INR", "LKR", "JPY"];

export default function AddExpensePage(): JSX.Element {
  const navigate = useNavigate();
  const { expenseId } = useParams<{ expenseId: string }>();
  const isEditing = Boolean(expenseId);

  const [categories, setCategories] = useState<Category[]>([]);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [categoryId, setCategoryId] = useState("");
  const [expenseDate, setExpenseDate] = useState(today());
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void listCategories({ limit: 100 }).then((page) => setCategories(page?.data ?? []));
  }, []);

  useEffect(() => {
    if (!expenseId) return;
    void getExpense(expenseId).then((expense) => {
      if (!expense) return;
      setAmount(String(expense.amount));
      setCurrency(expense.currency);
      setCategoryId(expense.categoryId);
      setExpenseDate(expense.expenseDate);
      setNote(expense.note ?? "");
      setLoading(false);
    });
  }, [expenseId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount greater than zero.");
      return;
    }
    if (!categoryId) {
      setError("Choose a category.");
      return;
    }
    setSaving(true);
    try {
      const input = {
        amount: parsedAmount,
        currency,
        expenseDate,
        categoryId,
        note: note || undefined,
      };
      if (isEditing && expenseId) {
        await updateExpense(expenseId, input);
      } else {
        await createExpense(input);
      }
      navigate("/expenses");
    } catch {
      setError("Could not save the expense. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>{isEditing ? "Edit Expense" : "Add Expense"}</PageTitle.Header>
      </PageTitle>

      <Box component="form" onSubmit={(e: FormEvent) => void handleSubmit(e)} sx={{ maxWidth: 640 }}>
        <Form.Stack spacing={3}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={loading}
              fullWidth
              slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
            />
            <TextField
              select
              label="Currency (default USD)"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={loading}
              fullWidth
            >
              {CURRENCIES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <TextField
            select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            disabled={loading}
            fullWidth
          >
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Date"
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            required
            disabled={loading}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />

          <TextField
            label="Note (optional)"
            multiline
            minRows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={loading}
            fullWidth
          />

          {error && (
            <Box sx={{ color: "error.main" }}>{error}</Box>
          )}

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="outlined" onClick={() => navigate("/expenses")} disabled={saving}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" disabled={loading || saving}>
              Save Expense
            </Button>
          </Stack>
        </Form.Stack>
      </Box>
    </PageContent>
  );
}
