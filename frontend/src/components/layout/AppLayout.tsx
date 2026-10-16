import { useState } from "react";
import { Link as RouterLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import { useAuth } from "../../hooks/useAuth";

const DRAWER_WIDTH = 220;

const userNav = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardOutlinedIcon /> },
  { label: "Expenses", path: "/expenses", icon: <ReceiptLongOutlinedIcon /> },
  { label: "Budget", path: "/budget", icon: <SavingsOutlinedIcon /> },
];

const adminNav = [
  { label: "Insights", path: "/admin", icon: <AdminPanelSettingsOutlinedIcon /> },
  { label: "Categories", path: "/admin/categories", icon: <CategoryOutlinedIcon /> },
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

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar sx={{ gap: 1 }}>
        <SavingsOutlinedIcon color="primary" />
        <Typography variant="h3" component={RouterLink} to="/dashboard" sx={{ textDecoration: "none", color: "inherit" }}>
          Retain
        </Typography>
      </Toolbar>
      <Divider />
      <List dense>
        {userNav.map(({ label, path, icon }) => (
          <ListItem key={path} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={path}
              selected={location.pathname === path}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {isAdmin && (
        <>
          <Divider />
          <List dense subheader={<Typography variant="caption" sx={{ px: 2, py: 1, display: "block", color: "text.secondary" }}>Admin</Typography>}>
            {adminNav.map(({ label, path, icon }) => (
              <ListItem key={path} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={path}
                  selected={location.pathname === path}
                  onClick={() => setMobileOpen(false)}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
                  <ListItemText primary={label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" elevation={0} sx={{ zIndex: (t) => t.zIndex.drawer + 1, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", color: "text.primary" }}>
        <Toolbar>
          <IconButton edge="start" sx={{ mr: 1, display: { sm: "none" } }} onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 14 }}>
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <Typography variant="body2">{user?.name}</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Sign out</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}>
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer variant="permanent"
        sx={{ display: { xs: "none", sm: "block" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" } }}>
        {drawerContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: { sm: `${DRAWER_WIDTH}px` }, minHeight: "100vh" }}>
        <Outlet />
      </Box>
    </Box>
  );
}
