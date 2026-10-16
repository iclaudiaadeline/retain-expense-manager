import { useEffect, useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton, Stack, TextField, Typography,
  CircularProgress, List, ListItem, ListItemText, ListItemSecondaryAction,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { api, ApiError } from "../../api/client";
import type { Category } from "../../types/api";

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create / rename dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    api.get<Category[]>("/categories")
      .then(setCategories)
      .catch(() => setError("Failed to load categories."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setEditing(null); setName(""); setNameError(""); setDialogOpen(true); }
  function openEdit(cat: Category) { setEditing(cat); setName(cat.name); setNameError(""); setDialogOpen(true); }

  async function handleSave() {
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
    try {
      await api.delete(`/categories/${deleteTarget.id}`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Box maxWidth={640}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h2">Manage Categories</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>New category</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 8 }}><CircularProgress /></Box>
      ) : (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <List disablePadding>
              {categories.map((cat, i) => (
                <ListItem key={cat.id} divider={i < categories.length - 1}>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>{cat.name}</Typography>
                        {cat.isDefault && <Chip label="default" size="small" color="primary" variant="outlined" />}
                      </Stack>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      size="small"
                      onClick={() => openEdit(cat)}
                      disabled={cat.isDefault}
                      title={cat.isDefault ? "Cannot rename the default category" : "Rename"}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => { setDeleteError(null); setDeleteTarget(cat); }}
                      disabled={cat.isDefault}
                      title={cat.isDefault ? "Cannot delete the default category" : "Delete"}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Create / rename dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? "Rename category" : "New category"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth label="Category name" value={name}
            onChange={(e) => setName(e.target.value)}
            error={Boolean(nameError)} helperText={nameError}
            sx={{ mt: 1 }}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete category?</DialogTitle>
        <DialogContent>
          <Typography>
            Delete <strong>{deleteTarget?.name}</strong>? All expenses in this category will be moved to{" "}
            <strong>Uncategorized</strong>.
          </Typography>
          {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
