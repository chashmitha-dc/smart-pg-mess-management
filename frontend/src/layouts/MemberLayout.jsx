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

const drawerWidth = 260;

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
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Avatar
          src={member?.profile_image || ""}
          sx={{
            width: 70,
            height: 70,
            mx: "auto",
            mb: 2,
            bgcolor: "#00b4db",
            fontSize: "2rem",
          }}
        >
          {member?.member_name?.charAt(0) || "M"}
        </Avatar>

        <Typography fontWeight="bold">
          {member?.member_name || "Member Name"}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-all" }}>
          {member?.phone}
        </Typography>

        {member?.plan_name && (
          <Box mt={1}>
            <Typography
              variant="caption"
              sx={{
                bgcolor: "#e0f7fa",
                color: "#006064",
                px: 1.5,
                py: 0.5,
                borderRadius: 10,
                fontWeight: "bold",
              }}
            >
              {member.plan_name}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1, overflowY: "auto" }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={NavLink}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            sx={(theme) => ({
              mx: 1,
              borderRadius: 2,
              mb: 0.5,
              transition: "all 0.2s ease",
              "&.active": {
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light || theme.palette.primary.main} 100%)`,
                color: "white",
                boxShadow: "0 4px 12px rgba(112, 26, 117, 0.15)",
                "& .MuiListItemIcon-root": {
                  color: "white",
                },
              },
              "&:hover": {
                borderRadius: 2,
              }
            })}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      <Box p={2}>
        <Button
          fullWidth
          color="primary"
          variant="outlined"
          onClick={() => {
            setMobileOpen(false);
            navigate("/member/profile");
          }}
          startIcon={<SettingsIcon />}
          sx={{ mb: 1.5 }}
        >
          Profile Settings
        </Button>
        <Button
          fullWidth
          color="error"
          variant="contained"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
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
        sx={{
          zIndex: 1201,
          background: "linear-gradient(135deg,#00b4db,#0083b0)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
              Member Hub
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <IconButton color="inherit" onClick={toggleColorMode}>
              {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
            <Tooltip title="Logout">
              <IconButton color="inherit" onClick={handleLogout}>
                <LogoutIcon />
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
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
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
