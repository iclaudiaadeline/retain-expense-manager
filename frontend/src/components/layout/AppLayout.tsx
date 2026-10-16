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
import { useAuth } from "../../hooks/useAuth";

const DRAWER_WIDTH = 248;

const userNav = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardOutlinedIcon fontSize="small" /> },
  { label: "Expenses",  path: "/expenses",  icon: <ReceiptLongOutlinedIcon fontSize="small" /> },
  { label: "Budget",    path: "/budget",    icon: <SavingsOutlinedIcon fontSize="small" /> },
];

const adminNav = [
  { label: "Insights",   path: "/admin",            icon: <AdminPanelSettingsOutlinedIcon fontSize="small" /> },
  { label: "Categories", path: "/admin/categories", icon: <CategoryOutlinedIcon fontSize="small" /> },
];

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function NavItems({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <>
        <List sx={{ px: 1.5 }}>
          {userNav.map(({ label, path, icon }) => (
            <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={RouterLink}
                to={path}
                selected={location.pathname === path}
                onClick={onNavigate}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "& .MuiListItemIcon-root": { color: "white" },
                    "&:hover": { bgcolor: "primary.dark" },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
                <ListItemText
                  primary={label}
                  slotProps={{ primary: { fontSize: "0.9rem", fontWeight: location.pathname === path ? 600 : 400 } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {isAdmin && (
          <>
            <Divider sx={{ mx: 2, my: 1 }} />
            <Typography
              variant="caption"
              sx={{ px: 3, mb: 0.5, display: "block", color: "text.disabled", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              Admin
            </Typography>
            <List sx={{ px: 1.5 }}>
              {adminNav.map(({ label, path, icon }) => (
                <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={RouterLink}
                    to={path}
                    selected={location.pathname === path}
                    onClick={onNavigate}
                    sx={{
                      borderRadius: 2,
                      py: 1,
                      "&.Mui-selected": {
                        bgcolor: "secondary.main",
                        color: "white",
                        "& .MuiListItemIcon-root": { color: "white" },
                        "&:hover": { bgcolor: "secondary.dark" },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
                    <ListItemText
                      primary={label}
                      slotProps={{ primary: { fontSize: "0.9rem", fontWeight: location.pathname === path ? 600 : 400 } }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </>
    );
  }

  const sidebarContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 3, py: 2.5 }}>
        <SavingsOutlinedIcon color="primary" sx={{ fontSize: 26 }} />
        <Typography
          component={RouterLink}
          to="/dashboard"
          sx={{ textDecoration: "none", color: "inherit", fontWeight: 700, fontSize: "1.15rem" }}
        >
          Retain
        </Typography>
      </Stack>
      <Divider />
      <Box sx={{ flex: 1, overflowY: "auto", pt: 2 }}>
        <NavItems onNavigate={() => setMobileOpen(false)} />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar sx={{ minHeight: "64px !important", px: { xs: 2, sm: 3 } }}>
          <IconButton edge="start" sx={{ mr: 1, display: { sm: "none" } }} onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
              {user?.name}
            </Typography>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ p: 0 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: "0.9rem", fontWeight: 700 }}>
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Stack>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            slotProps={{ paper: { sx: { mt: 1, minWidth: 200 } } }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" fontWeight={600}>{user?.name}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: "error.main", py: 1.25 }}>
              Sign out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}
      >
        {sidebarContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", borderRight: "1px solid #e5e7eb" },
        }}
      >
        {sidebarContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: "64px",
          p: { xs: 2, sm: 4 },
          minHeight: "calc(100vh - 64px)",
          maxWidth: "100%",
          overflow: "auto",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
