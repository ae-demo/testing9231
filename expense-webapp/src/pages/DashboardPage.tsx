import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  ListingTable,
  PageContent,
  PageTitle,
  Typography,
} from "@wso2/oxygen-ui";
import { Plus } from "@wso2/oxygen-ui-icons-react";
import { getTotals, listCategories, listExpenses, type CategoryStatus } from "../api";
import { formatMoney, startOfMonth, startOfWeek, today } from "../format";

interface StatValue {
  label: string;
  value: string;
  caption: string;
}

const STATUS_LABEL: Record<CategoryStatus["status"] & string, string> = {
  ok: "On track",
  approaching: "Approaching limit",
  exceeded: "Over limit",
};

const STATUS_COLOR: Record<string, "success" | "warning" | "error"> = {
  ok: "success",
  approaching: "warning",
  exceeded: "error",
};

export default function DashboardPage(): JSX.Element {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatValue[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryStatus[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      const ranges: { label: string; period: "daily" | "weekly" | "monthly"; from: string }[] = [
        { label: "Today", period: "daily", from: today() },
        { label: "This Week", period: "weekly", from: startOfWeek() },
        { label: "This Month", period: "monthly", from: startOfMonth() },
      ];
      const results = await Promise.all(
        ranges.map(async (r) => {
          const [totals, page] = await Promise.all([
            getTotals(r.period),
            listExpenses({ from: r.from, to: today(), limit: 1 }),
          ]);
          return {
            label: r.label,
            value: formatMoney(totals?.total ?? 0),
            caption: `${page?.count ?? 0} expense${page?.count === 1 ? "" : "s"}`,
          };
        }),
      );
      if (!cancelled) {
        setStats(results);
        setStatsLoading(false);
      }
    }

    async function loadCategories() {
      const page = await listCategories({ limit: 100 });
      if (!cancelled) {
        setCategories(page?.data ?? []);
        setCategoriesLoading(false);
      }
    }

    void loadStats();
    void loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Spending Overview</PageTitle.Header>
      </PageTitle>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {(statsLoading ? [{ label: "Today", value: "…", caption: "" }, { label: "This Week", value: "…", caption: "" }, { label: "This Month", value: "…", caption: "" }] : stats).map(
          (s) => (
            <Grid key={s.label} size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="overline" color="text.secondary">
                    {s.label}
                  </Typography>
                  <Typography variant="h4">{s.value}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {s.caption}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ),
        )}
      </Grid>

      <Typography variant="h6" sx={{ mb: 2 }}>
        By Category
      </Typography>

      <ListingTable.Container disablePaper>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Category</ListingTable.Cell>
              <ListingTable.Cell>Spent</ListingTable.Cell>
              <ListingTable.Cell>Limit</ListingTable.Cell>
              <ListingTable.Cell>Status</ListingTable.Cell>
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {!categoriesLoading && categories.length === 0 ? (
              <ListingTable.Row>
                <ListingTable.Cell colSpan={4}>
                  <ListingTable.EmptyState title="No categories yet" description="Create a category to start tracking limits" />
                </ListingTable.Cell>
              </ListingTable.Row>
            ) : (
              categories.map((c) => (
                <ListingTable.Row key={c.id}>
                  <ListingTable.Cell>{c.name}</ListingTable.Cell>
                  <ListingTable.Cell>{formatMoney(c.spent ?? 0)}</ListingTable.Cell>
                  <ListingTable.Cell>{formatMoney(c.limitAmount)}</ListingTable.Cell>
                  <ListingTable.Cell>
                    <Chip
                      label={c.status ? STATUS_LABEL[c.status] : "—"}
                      color={c.status ? STATUS_COLOR[c.status] : "default"}
                      size="small"
                    />
                  </ListingTable.Cell>
                </ListingTable.Row>
              ))
            )}
          </ListingTable.Body>
        </ListingTable>
      </ListingTable.Container>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate("/expenses/new")}>
          Add Expense
        </Button>
      </Box>
    </PageContent>
  );
}
