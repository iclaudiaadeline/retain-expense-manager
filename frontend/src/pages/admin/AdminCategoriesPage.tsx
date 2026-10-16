import { useEffect, useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
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
    <Box maxWidth={680}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h2">Categories</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage expense categories across the platform.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          New category
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Stack divider={<Divider />} spacing={0}>
              {categories.map((cat) => (
                <Stack
                  key={cat.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ px: 3, py: 2 }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography variant="body1" fontWeight={500}>{cat.name}</Typography>
                    {cat.isDefault && (
                      <Chip label="default" size="small" color="primary" variant="outlined" />
                    )}
                  </Stack>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      size="small"
                      onClick={() => openEdit(cat)}
                      disabled={cat.isDefault}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => { setDeleteError(null); setDeleteTarget(cat); }}
                      disabled={cat.isDefault}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ pb: 1 }}>
          {editing ? "Rename category" : "New category"}
        </DialogTitle>
        <DialogContent sx={{ pt: "12px !important" }}>
          <TextField
            autoFocus
            fullWidth
            label="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={Boolean(nameError)}
            helperText={nameError}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Delete category?</DialogTitle>
        <DialogContent sx={{ pt: "12px !important" }}>
          <Typography variant="body2">
            Deleting <strong>{deleteTarget?.name}</strong> will move all its expenses to{" "}
            <strong>Uncategorized</strong>. This cannot be undone.
          </Typography>
          {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
