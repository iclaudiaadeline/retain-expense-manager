import { useState } from "react";
import { Link as RouterLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  AppBar, Avatar, Box, Divider, Drawer, IconButton,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Menu, MenuItem, Stack, Toolbar, Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../hooks/useAuth";

const DRAWER_WIDTH = 256;

const userNav = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardOutlinedIcon fontSize="small" /> },
  { label: "Expenses",  path: "/expenses",  icon: <ReceiptLongOutlinedIcon fontSize="small" /> },
  { label: "Budget",    path: "/budget",    icon: <SavingsOutlinedIcon fontSize="small" /> },
];

const adminNav = [
  { label: "Insights",   path: "/admin",            icon: <AdminPanelSettingsOutlinedIcon fontSize="small" /> },
  { label: "Categories", path: "/admin/categories", icon: <CategoryOutlinedIcon fontSize="small" /> },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":        "Dashboard",
  "/expenses":         "Expenses",
  "/budget":           "Budget",
  "/admin":            "Insights",
  "/admin/categories": "Categories",
};

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  function handleLogout() { logout(); navigate("/login"); }
  const close = () => setMobileOpen(false);

  function NavItem({
    label, path, icon, activeColor = "#0f766e", activeDark = "#0d6460",
  }: {
    label: string; path: string; icon: React.ReactNode;
    activeColor?: string; activeDark?: string;
  }) {
    const selected = location.pathname === path;
    return (
      <ListItem disablePadding sx={{ mb: 0.5 }}>
        <ListItemButton
          component={RouterLink}
          to={path}
          selected={selected}
          onClick={close}
          sx={{
            borderRadius: 2,
            py: 1,
            px: 1.5,
            "&.Mui-selected": {
              bgcolor: activeColor,
              color: "white",
              "& .MuiListItemIcon-root": { color: "white" },
              "&:hover": { bgcolor: activeDark },
            },
            "&:not(.Mui-selected):hover": { bgcolor: "rgba(0,0,0,0.04)" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 34, color: selected ? "inherit" : "text.secondary" }}>
            {icon}
          </ListItemIcon>
          <ListItemText
            primary={label}
            slotProps={{ primary: { sx: { fontSize: "0.875rem", fontWeight: selected ? 600 : 400 } } }}
          />
        </ListItemButton>
      </ListItem>
    );
  }

  const sidebar = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "background.paper" }}>

      {/* Brand */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", px: 3, py: 2.5 }}>
        <SavingsOutlinedIcon sx={{ fontSize: 22, color: "primary.main" }} />
        <Typography
          component={RouterLink}
          to="/dashboard"
          sx={{ textDecoration: "none", color: "text.primary", fontWeight: 700, fontSize: "1.05rem" }}
        >
          Retain
        </Typography>
      </Stack>

      <Divider />

      {/* User nav */}
      <Box sx={{ px: 1.5, pt: 2, pb: 1 }}>
        <List disablePadding>
          {userNav.map(({ label, path, icon }) => (
            <NavItem key={path} label={label} path={path} icon={icon} />
          ))}
        </List>
      </Box>

      {/* Admin nav — only shown to admins, clearly separated */}
      {isAdmin && (
        <>
          <Divider sx={{ mx: 2 }} />
          <Box sx={{ px: 1.5, pt: 2, pb: 1 }}>
            <Typography
              variant="caption"
              sx={{
                px: 1.5, mb: 1.5, display: "block",
                color: "text.disabled", fontWeight: 700,
                letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.68rem",
              }}
            >
              Admin
            </Typography>
            <List disablePadding>
              {adminNav.map(({ label, path, icon }) => (
                <NavItem key={path} label={label} path={path} icon={icon}
                  activeColor="#4f46e5" activeDark="#4338ca" />
              ))}
            </List>
          </Box>
        </>
      )}

      <Box sx={{ flexGrow: 1 }} />

      {/* User strip */}
      <Divider />
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", px: 2.5, py: 2 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0 }}>
          {user?.name?.[0]?.toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{user?.name}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>{user?.email}</Typography>
        </Box>
        <IconButton size="small" onClick={handleLogout} title="Sign out" sx={{ color: "text.secondary", flexShrink: 0 }}>
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>

      {/* Green top bar — page title on the left, avatar on the right */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar sx={{ minHeight: "60px !important", px: { xs: 2, sm: 3 } }}>
          <IconButton edge="start" sx={{ mr: 1.5, display: { sm: "none" }, color: "white" }}
            onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </IconButton>

          {/* Page title — left aligned */}
          <Typography variant="h3" sx={{ flexGrow: 1, color: "white", fontWeight: 600, fontSize: "1rem" }}>
            {PAGE_TITLES[location.pathname] ?? "Retain"}
          </Typography>

          {/* Avatar */}
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ p: 0 }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: "rgba(255,255,255,0.2)", fontSize: "0.85rem", fontWeight: 700, color: "white", border: "2px solid rgba(255,255,255,0.4)" }}>
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            slotProps={{ paper: { sx: { mt: 1, minWidth: 200 } } }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.name}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: "error.main", gap: 1.5, py: 1.25 }}>
              <LogoutIcon fontSize="small" /> Sign out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer variant="temporary" open={mobileOpen} onClose={close}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}>
        {sidebar}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          width: DRAWER_WIDTH, flexShrink: 0,
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", borderRight: "1px solid #e5e7eb" },
        }}>
        {sidebar}
      </Drawer>

      {/* Page content */}
      <Box component="main" sx={{
        flexGrow: 1,
        mt: "60px",
        p: { xs: 2.5, sm: 4 },
        minHeight: "calc(100vh - 60px)",
        maxWidth: "100%",
        overflow: "auto",
      }}>
        <Outlet />
      </Box>
    </Box>
  );
}
