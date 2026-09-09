import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router";
import { Button, Chip, IconButton, ListingTable, PageContent, PageTitle, Tooltip } from "@wso2/oxygen-ui";
import { Plus, Pencil, Trash2 } from "@wso2/oxygen-ui-icons-react";
import { deleteCategory, listCategories, type CategoryStatus } from "../api";
import { formatMoney } from "../format";
import ConfirmDialog from "../components/ConfirmDialog";

const STATUS_LABEL: Record<string, string> = {
  ok: "On track",
  approaching: "Approaching limit",
  exceeded: "Exceeded",
};

const STATUS_COLOR: Record<string, "success" | "warning" | "error"> = {
  ok: "success",
  approaching: "warning",
  exceeded: "error",
};

export default function CategoriesPage(): JSX.Element {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<CategoryStatus | null>(null);

  async function reload() {
    setLoading(true);
    const page = await listCategories({ limit: 100 });
    setCategories(page?.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void reload();
  }, []);

  async function confirmDelete() {
    if (!pendingDelete) return;
    await deleteCategory(pendingDelete.id);
    setPendingDelete(null);
    await reload();
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Categories</PageTitle.Header>
        <PageTitle.SubHeader>Manage categories and their spending limits</PageTitle.SubHeader>
        <PageTitle.Actions>
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate("/categories/new")}>
            New Category
          </Button>
        </PageTitle.Actions>
      </PageTitle>

      <ListingTable.Container disablePaper>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Category</ListingTable.Cell>
              <ListingTable.Cell>Limit</ListingTable.Cell>
              <ListingTable.Cell>Spent This Month</ListingTable.Cell>
              <ListingTable.Cell>Status</ListingTable.Cell>
              <ListingTable.Cell align="right">Actions</ListingTable.Cell>
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {!loading && categories.length === 0 ? (
              <ListingTable.Row>
                <ListingTable.Cell colSpan={5}>
                  <ListingTable.EmptyState title="No categories yet" description="Create a category to start tracking limits" />
                </ListingTable.Cell>
              </ListingTable.Row>
            ) : (
              categories.map((c) => (
                <ListingTable.Row key={c.id}>
                  <ListingTable.Cell>{c.name}</ListingTable.Cell>
                  <ListingTable.Cell>{formatMoney(c.limitAmount)}</ListingTable.Cell>
                  <ListingTable.Cell>{formatMoney(c.spent ?? 0)}</ListingTable.Cell>
                  <ListingTable.Cell>
                    <Chip
                      label={c.status ? STATUS_LABEL[c.status] : "—"}
                      color={c.status ? STATUS_COLOR[c.status] : "default"}
                      size="small"
                    />
                  </ListingTable.Cell>
                  <ListingTable.Cell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => navigate(`/categories/${c.id}/edit`)}>
                        <Pencil size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setPendingDelete(c)}>
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
        title="Delete category"
        message={`Delete "${pendingDelete?.name ?? ""}"? Expenses already logged against it are unaffected.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </PageContent>
  );
}
