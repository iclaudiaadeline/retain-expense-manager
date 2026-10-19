import { useState } from "react";
import { Link as RouterLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  AppBar, Avatar, Box, Divider, Drawer, IconButton,
  List, ListItem, ListItemButton, ListItemText,
  Menu, MenuItem, Stack, Toolbar, Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../hooks/useAuth";

const DRAWER_WIDTH = 256;

// Sidebar colours: a dark shade of the brand green, with light text on top
const SIDEBAR_BG = "#115e59";
const SIDEBAR_TEXT = "rgba(255,255,255,0.85)";
const SIDEBAR_MUTED = "rgba(255,255,255,0.65)";
const SIDEBAR_LINE = "rgba(255,255,255,0.15)";

const userNav = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Expenses",  path: "/expenses" },
  { label: "Budget",    path: "/budget" },
];

const adminNav = [
  { label: "Insights",   path: "/admin" },
  { label: "Categories", path: "/admin/categories" },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":        "Dashboard",
  "/expenses":         "Expenses",
  "/budget":           "Budget",
  "/admin":            "Insights",
  "/admin/categories": "Categories",
};

interface NavItemProps {
  label: string;
  path: string;
  /** True when this is the page being shown. */
  selected: boolean;
  /** Called on click, so the mobile drawer can close. */
  onClick: () => void;
}

/**
 * One sidebar link. Defined outside AppLayout so React keeps the same component between renders;
 * a component declared inside another is recreated, and remounted, every time the parent renders.
 */
function NavItem({ label, path, selected, onClick }: NavItemProps) {
  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        component={RouterLink}
        to={path}
        selected={selected}
        onClick={onClick}
        sx={{
          borderRadius: 2,
          py: 1,
          px: 1.5,
          color: SIDEBAR_TEXT,
          // The current page is a white pill with green text, so it stands out on the green sidebar
          "&.Mui-selected": {
            bgcolor: "white",
            color: "primary.main",
            "&:hover": { bgcolor: "white" },
          },
          "&:not(.Mui-selected):hover": { bgcolor: "rgba(255,255,255,0.1)" },
        }}
      >
        <ListItemText
          primary={label}
          slotProps={{ primary: { sx: { fontSize: "0.875rem", fontWeight: selected ? 600 : 400 } } }}
        />
      </ListItemButton>
    </ListItem>
  );
}

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  function handleLogout() { logout(); navigate("/login"); }
  const close = () => setMobileOpen(false);

  const sidebar = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: SIDEBAR_BG }}>

      {/* Brand */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", px: 3, py: 2.5 }}>
        <Typography
          component={RouterLink}
          to={isAdmin ? "/admin" : "/dashboard"}
          sx={{ textDecoration: "none", color: "white", fontWeight: 700, fontSize: "1.05rem" }}
        >
          Retain
        </Typography>
      </Stack>

      {/* Each role sees only its own pages: users manage their money, admins manage the platform */}
      {isAdmin ? (
        <Box sx={{ px: 1.5, pt: 2, pb: 1 }}>
          <Typography
            variant="caption"
            sx={{
              px: 1.5, mb: 1.5, display: "block",
              color: SIDEBAR_MUTED, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.68rem",
            }}
          >
            Admin
          </Typography>
          <List disablePadding>
            {adminNav.map(({ label, path }) => (
              <NavItem key={path} label={label} path={path} selected={location.pathname === path} onClick={close} />
            ))}
          </List>
        </Box>
      ) : (
        <Box sx={{ px: 1.5, pt: 2, pb: 1 }}>
          <List disablePadding>
            {userNav.map(({ label, path }) => (
              <NavItem key={path} label={label} path={path} selected={location.pathname === path} onClick={close} />
            ))}
          </List>
        </Box>
      )}

      <Box sx={{ flexGrow: 1 }} />

      {/* User strip */}
      <Divider sx={{ borderColor: SIDEBAR_LINE }} />
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", px: 2.5, py: 2 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: "rgba(255,255,255,0.2)", color: "white", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0 }}>
          {user?.name?.[0]?.toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: "white" }}>{user?.name}</Typography>
          <Typography variant="caption" noWrap sx={{ display: "block", color: SIDEBAR_MUTED }}>{user?.email}</Typography>
        </Box>
        <IconButton size="small" onClick={handleLogout} title="Sign out" sx={{ color: SIDEBAR_MUTED, flexShrink: 0, "&:hover": { color: "white" } }}>
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>

      {/* White top bar — page title on the left, avatar on the right */}
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
          <IconButton edge="start" sx={{ mr: 1.5, display: { sm: "none" }, color: "text.primary" }}
            onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </IconButton>

          {/* Page title — left aligned */}
          <Typography variant="h3" sx={{ flexGrow: 1, color: "text.primary", fontWeight: 600, fontSize: "1rem" }}>
            {PAGE_TITLES[location.pathname] ?? "Retain"}
          </Typography>

          {/* Avatar */}
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ p: 0 }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: "0.85rem", fontWeight: 700, color: "white" }}>
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
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", borderRight: "none" },
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
