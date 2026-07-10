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

  const handleLogout = () => {
    logout();
    navigate("/member/login");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1201,
          background: "linear-gradient(135deg,#00b4db,#0083b0)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight="bold">
            Member Hub - SmartPG
          </Typography>
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

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            mt: 8,
          },
        }}
      >
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

          <Typography variant="body2" color="text.secondary">
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

        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              component={NavLink}
              to={item.path}
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

        <Box sx={{ flexGrow: 1 }} />

        <Box p={2}>
          <Button
            fullWidth
            color="primary"
            variant="outlined"
            onClick={() => navigate("/member/profile")}
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
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${drawerWidth}px`,
          mt: 8,
          p: 4,
          background: "#f0f4f8",
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default MemberLayout;
