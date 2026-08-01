import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Tooltip,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useColorMode } from "../context/ThemeContext";

const drawerWidth = 280;

const menuItems = [
  {
    text: "Dashboard",
    path: "/member/dashboard",
    icon: <DashboardIcon />,
  },
  {
    text: "Leave Requests",
    path: "/member/leaves",
    icon: <EventBusyIcon />,
  },
  {
    text: "My Bills",
    path: "/member/bills",
    icon: <ReceiptIcon />,
  },
  {
    text: "My Complaints",
    path: "/member/complaints",
    icon: <ReportProblemIcon />,
  },
  {
    text: "Announcements",
    path: "/member/notifications",
    icon: <NotificationsIcon />,
  },
];

function MemberLayout() {
  const navigate = useNavigate();
  const { toggleColorMode, mode } = useColorMode();
  const { member, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/member/login");
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "background.paper" }}>
      {/* Spacer matching AppBar height so mobile drawer content starts below AppBar */}
      <Toolbar sx={{ display: { md: "none" }, minHeight: { xs: "60px !important", md: "64px !important" } }} />

      {/* Compact Profile Header */}
      <Box
        sx={{
          p: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 2,
          bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0, 180, 219, 0.05)",
        }}
      >
        <Avatar
          src={member?.profile_image || ""}
          sx={{
            width: 44,
            height: 44,
            bgcolor: "#00b4db",
            fontSize: "1.1rem",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0, 180, 219, 0.25)",
          }}
        >
          {member?.member_name?.charAt(0) || "M"}
        </Avatar>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography fontWeight="700" variant="subtitle2" noWrap sx={{ fontSize: "0.95rem" }}>
            {member?.member_name || "Member Name"}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: "0.75rem" }}>
            {member?.phone}
          </Typography>
          {member?.plan_name && (
            <Typography
              variant="caption"
              sx={{
                display: "inline-block",
                mt: 0.25,
                bgcolor: "#e0f7fa",
                color: "#006064",
                px: 1,
                py: 0.2,
                borderRadius: 4,
                fontWeight: "700",
                fontSize: "0.68rem",
              }}
            >
              {member.plan_name}
            </Typography>
          )}
        </Box>
      </Box>

      <Divider />

      {/* Navigation List */}
      <List sx={{ flexGrow: 1, overflowY: "auto", px: 1.5, py: 1.5 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={NavLink}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            sx={(theme) => ({
              borderRadius: "6px",
              my: 0.5,
              py: 1,
              px: 1.5,
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              "& .MuiListItemIcon-root": {
                minWidth: 36,
                color: theme.palette.text.secondary,
                fontSize: 22,
              },
              "& .MuiListItemText-primary": {
                fontSize: "0.9rem",
                fontWeight: 500,
              },
              "&.active": {
                background: "linear-gradient(135deg, #00b4db 0%, #0083b0 100%)",
                color: "white",
                boxShadow: "0 4px 14px rgba(0, 180, 219, 0.3)",
                "& .MuiListItemIcon-root": {
                  color: "white",
                },
                "& .MuiListItemText-primary": {
                  fontWeight: 700,
                },
              },
              "&:hover": {
                borderRadius: "6px",
              },
            })}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      {/* Fixed Bottom Controls */}
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1, mt: "auto" }}>
        <Button
          fullWidth
          color="primary"
          variant="outlined"
          onClick={() => {
            setMobileOpen(false);
            navigate("/member/profile");
          }}
          startIcon={<SettingsIcon sx={{ fontSize: 20 }} />}
          sx={{
            height: "44px",
            borderRadius: "6px",
            fontWeight: "600",
            fontSize: "0.85rem",
            textTransform: "none",
          }}
        >
          Profile Settings
        </Button>
        <Button
          fullWidth
          color="error"
          variant="contained"
          startIcon={<LogoutIcon sx={{ fontSize: 20 }} />}
          onClick={handleLogout}
          sx={{
            height: "44px",
            borderRadius: "6px",
            fontWeight: "700",
            fontSize: "0.85rem",
            textTransform: "none",
            boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)",
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          zIndex: 1201,
          height: { xs: 60, md: 64 },
          justifyContent: "center",
          background: "linear-gradient(135deg,#00b4db,#0083b0)",
          borderRadius: 0,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            minHeight: { xs: "60px !important", md: "64px !important" },
            px: { xs: 1.5, sm: 3 },
          }}
        >
          <Box display="flex" alignItems="center">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1.5, display: { md: "none" }, p: 0.75 }}
            >
              <MenuIcon sx={{ fontSize: 24 }} />
            </IconButton>
            <Typography
              variant="h6"
              fontWeight="800"
              sx={{ fontSize: { xs: "1.05rem", sm: "1.25rem" }, letterSpacing: "-0.3px" }}
            >
              Member Hub
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <IconButton color="inherit" onClick={toggleColorMode} size="small" sx={{ p: 0.75 }}>
              {mode === "light" ? <DarkModeIcon sx={{ fontSize: 22 }} /> : <LightModeIcon sx={{ fontSize: 22 }} />}
            </IconButton>
            <Tooltip title="Logout">
              <IconButton color="inherit" onClick={handleLogout} size="small" sx={{ p: 0.75 }}>
                <LogoutIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Temporary Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
          disableScrollLock: false,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRadius: 0,
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Permanent Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            mt: 8,
            height: "calc(100vh - 64px)",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { xs: 0, md: `${drawerWidth}px` },
          mt: 8,
          p: { xs: 2, sm: 3, md: 4 },
          background: "#f0f4f8",
          minHeight: "100vh",
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          overflowX: "hidden",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default MemberLayout;
