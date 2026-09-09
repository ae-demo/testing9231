import { useEffect, useMemo, useState, type JSX } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Button,
  IconButton,
  ListingTable,
  MenuItem,
  PageContent,
  PageTitle,
  TextField,
  Tooltip,
} from "@wso2/oxygen-ui";
import { Plus, Pencil, Trash2, Search } from "@wso2/oxygen-ui-icons-react";
import { deleteExpense, listCategories, listExpenses, type Category, type Expense } from "../api";
import { formatMoney } from "../format";
import { getCurrentUserId } from "../auth";
import ConfirmDialog from "../components/ConfirmDialog";

export default function ExpensesPage(): JSX.Element {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  async function reload() {
    setLoading(true);
    const [expensePage, categoryPage, userId] = await Promise.all([
      listExpenses({ limit: 100, categoryId: categoryFilter || undefined }),
      listCategories({ limit: 100 }),
      getCurrentUserId(),
    ]);
    setExpenses(expensePage?.data ?? []);
    setCategories(categoryPage?.data ?? []);
    setCurrentUserId(userId);
    setLoading(false);
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return expenses;
    return expenses.filter((e) => {
      const categoryName = (categoryById.get(e.categoryId) ?? "").toLowerCase();
      const note = (e.note ?? "").toLowerCase();
      return categoryName.includes(q) || note.includes(q);
    });
  }, [expenses, search, categoryById]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    await deleteExpense(pendingDelete.id);
    setPendingDelete(null);
    await reload();
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Expenses</PageTitle.Header>
        <PageTitle.SubHeader>All household expenses, either member may edit</PageTitle.SubHeader>
        <PageTitle.Actions>
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate("/expenses/new")}>
            Add Expense
          </Button>
        </PageTitle.Actions>
      </PageTitle>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search expenses"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <Search size={18} style={{ marginRight: 8 }} /> } }}
          sx={{ flexGrow: 1 }}
        />
        <TextField select label="Category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value="">All categories</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <ListingTable.Container disablePaper>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Date</ListingTable.Cell>
              <ListingTable.Cell>Amount</ListingTable.Cell>
              <ListingTable.Cell>Category</ListingTable.Cell>
              <ListingTable.Cell>Note</ListingTable.Cell>
              <ListingTable.Cell>Logged By</ListingTable.Cell>
              <ListingTable.Cell align="right">Actions</ListingTable.Cell>
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {!loading && filtered.length === 0 ? (
              <ListingTable.Row>
                <ListingTable.Cell colSpan={6}>
                  <ListingTable.EmptyState title="No expenses found" description="Log your first expense to get started" />
                </ListingTable.Cell>
              </ListingTable.Row>
            ) : (
              filtered.map((e) => (
                <ListingTable.Row key={e.id}>
                  <ListingTable.Cell>{e.expenseDate}</ListingTable.Cell>
                  <ListingTable.Cell>
                    {e.currency !== "USD"
                      ? `${e.amount.toFixed(2)} ${e.currency} (${formatMoney(e.homeCurrencyAmount)})`
                      : formatMoney(e.amount)}
                  </ListingTable.Cell>
                  <ListingTable.Cell>{categoryById.get(e.categoryId) ?? "—"}</ListingTable.Cell>
                  <ListingTable.Cell>{e.note ?? ""}</ListingTable.Cell>
                  <ListingTable.Cell>{e.loggedBy === currentUserId ? "You" : "Household member"}</ListingTable.Cell>
                  <ListingTable.Cell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => navigate(`/expenses/${e.id}/edit`)}>
                        <Pencil size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setPendingDelete(e)}>
                        <Trash2 size={18} />
                      </IconButton>
                    </Tooltip>
                  </ListingTable.Cell>
                </ListingTable.Row>
              ))
            )}
          </ListingTable.Body>
        </ListingTable>
      </ListingTable.Container>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete expense"
        message={`Delete this ${pendingDelete ? formatMoney(pendingDelete.amount, pendingDelete.currency) : ""} expense? This cannot be undone.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </PageContent>
  );
}
