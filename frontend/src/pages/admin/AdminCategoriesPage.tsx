import { useEffect, useState } from "react";
import {
  Alert, Box, Button, Card, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  IconButton, Stack, TextField, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import { api, ApiError } from "../../api/client";
import type { Category } from "../../types/api";

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  /** Success message after a delete, e.g. how many expenses moved to the default category. */
  const [notice, setNotice] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    api.get<Category[]>("/categories")
      .then(setCategories)
      .catch(() => setError("Failed to load categories."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setEditing(null); setName(""); setNameError(""); setDialogOpen(true); }
  function openEdit(cat: Category) { setEditing(cat); setName(cat.name); setNameError(""); setDialogOpen(true); }

  async function handleSave() {
    // Pressing Enter again while a save is in progress would send a duplicate request
    if (saving) return;
    if (!name.trim()) { setNameError("Name is required."); return; }
    setSaving(true);
    setNameError("");
    try {
      if (editing) {
        await api.patch(`/categories/${editing.id}`, { name: name.trim() });
      } else {
        await api.post("/categories", { name: name.trim() });
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      setNameError(err instanceof ApiError ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    setNotice(null);
    try {
      const result = await api.delete<{ message: string; reassignedExpenses: number }>(`/categories/${deleteTarget.id}`);
      setNotice(result.message);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Box>
      {/* Page header */}
      <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h2">Categories</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {categories.length} {categories.length === 1 ? "category" : "categories"} on the platform
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          New category
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {notice && (
        <Alert severity="success" onClose={() => setNotice(null)} sx={{ mb: 3, maxWidth: 640 }}>{notice}</Alert>
      )}

      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ maxWidth: 640 }}>
          <Card>
            <Stack divider={<Divider />} spacing={0}>
              {categories.map((cat) => (
                <Stack key={cat.id} direction="row" sx={{ justifyContent: "space-between", alignItems: "center", px: 3, py: 2.5 }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{cat.name}</Typography>
                    {cat.isDefault && (
                      <Chip label="default" size="small" color="primary" variant="outlined" />
                    )}
                  </Stack>
                  <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                    <IconButton size="small" onClick={() => openEdit(cat)} disabled={cat.isDefault}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error"
                      onClick={() => { setDeleteError(null); setDeleteTarget(cat); }}
                      disabled={cat.isDefault}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Card>
        </Box>
      )}

      {/* Create / rename dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? "Rename category" : "New category"}</DialogTitle>
        <DialogContent sx={{ pt: "16px !important" }}>
          <TextField
            autoFocus fullWidth label="Category name"
            value={name} onChange={(e) => setName(e.target.value)}
            error={Boolean(nameError)} helperText={nameError}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete category?</DialogTitle>
        <DialogContent sx={{ pt: "16px !important" }}>
          <Typography variant="body2">
            Deleting <strong>{deleteTarget?.name}</strong> will move all its expenses to{" "}
            <strong>Uncategorized</strong>. This cannot be undone.
          </Typography>
          {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
