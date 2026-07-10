import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ApartmentIcon from "@mui/icons-material/Apartment";
import GroupsIcon from "@mui/icons-material/Groups";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import BarChartIcon from "@mui/icons-material/BarChart";
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
    path: "/dashboard",
    icon: <DashboardIcon />,
  },
  {
    text: "PG",
    path: "/pg",
    icon: <ApartmentIcon />,
  },
  {
    text: "Members",
    path: "/members",
    icon: <GroupsIcon />,
  },
  {
    text: "Meal Plans",
    path: "/meal-plans",
    icon: <RestaurantMenuIcon />,
  },
  {
    text: "Meal Price",
    path: "/meal-price",
    icon: <MonetizationOnIcon />,
  },
  {
    text: "Leave Management",
    path: "/leaves",
    icon: <EventBusyIcon />,
  },
  {
    text: "Billing",
    path: "/billing",
    icon: <MonetizationOnIcon />,
  },
  {
    text: "Payments",
    path: "/payments",
    icon: <PaymentsIcon />,
  },
  {
    text: "Complaints",
    path: "/complaints",
    icon: <ReportProblemIcon />,
  },
  {
    text: "Notifications",
    path: "/notifications",
    icon: <NotificationsIcon />,
  },
  {
    text: "AI Prediction",
    path: "/ai",
    icon: <SmartToyIcon />,
  },
  {
    text: "Reports & Analytics",
    path: "/reports",
    icon: <BarChartIcon />,
  },
];

function DashboardLayout() {
  const navigate = useNavigate();
  const { toggleColorMode, mode } = useColorMode();
  const { owner, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1201,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            fontWeight="bold"
          >
            SmartPG & Mess Management
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
        <Box
          sx={{
            p: 3,
            textAlign: "center",
          }}
        >
          <Avatar
            sx={{
              width: 70,
              height: 70,
              mx: "auto",
              mb: 2,
            }}
          >
            {owner?.name?.charAt(0) || "A"}
          </Avatar>

          <Typography fontWeight="bold">
            {owner?.name || "Owner"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {owner?.email}
          </Typography>
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
                  boxShadow: "0 4px 12px rgba(30, 64, 175, 0.15)",
                  "& .MuiListItemIcon-root": {
                    color: "white",
                  },
                },
                "&:hover": {
                  borderRadius: 2,
                }
              })}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.text}
              />
            </ListItemButton>
          ))}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        <Box p={2}>
          <Button
            fullWidth
            color="primary"
            variant="outlined"
            onClick={() => navigate("/settings")}
            startIcon={<SettingsIcon />}
            sx={{ mb: 1.5 }}
          >
            Settings
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
          background: "#f5f7fb",
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default DashboardLayout;