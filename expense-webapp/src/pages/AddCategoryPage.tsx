import { useEffect, useState, type FormEvent, type JSX } from "react";
import { useNavigate, useParams } from "react-router";
import { Box, Button, Form, PageContent, PageTitle, Stack, TextField } from "@wso2/oxygen-ui";
import { createCategory, listCategories, updateCategory } from "../api";

export default function AddCategoryPage(): JSX.Element {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const isEditing = Boolean(categoryId);

  const [name, setName] = useState("");
  const [limitAmount, setLimitAmount] = useState("");
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) return;
    // No single-category GET in the contract — find it in the one list call.
    void listCategories({ limit: 100 }).then((page) => {
      const existing = page?.data.find((c) => c.id === categoryId);
      if (existing) {
        setName(existing.name);
        setLimitAmount(String(existing.limitAmount));
      }
      setLoading(false);
    });
  }, [categoryId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const parsedLimit = Number(limitAmount);
    if (!name.trim()) {
      setError("Enter a category name.");
      return;
    }
    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      setError("Enter a valid monthly limit greater than zero.");
      return;
    }
    setSaving(true);
    try {
      const input = { name: name.trim(), limitAmount: parsedLimit };
      if (isEditing && categoryId) {
        await updateCategory(categoryId, input);
      } else {
        await createCategory(input);
      }
      navigate("/categories");
    } catch {
      setError("Could not save the category. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>{isEditing ? "Edit Category" : "New Category"}</PageTitle.Header>
      </PageTitle>

      <Box component="form" onSubmit={(e: FormEvent) => void handleSubmit(e)} sx={{ maxWidth: 480 }}>
        <Form.Stack spacing={3}>
          <TextField
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            fullWidth
          />
          <TextField
            label="Monthly Limit"
            type="number"
            value={limitAmount}
            onChange={(e) => setLimitAmount(e.target.value)}
            required
            disabled={loading}
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
          />

          {error && <Box sx={{ color: "error.main" }}>{error}</Box>}

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="outlined" onClick={() => navigate("/categories")} disabled={saving}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" disabled={loading || saving}>
              Save Category
            </Button>
          </Stack>
        </Form.Stack>
      </Box>
    </PageContent>
  );
}
