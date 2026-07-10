import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  Dashboard,
  Groups,
  RestaurantMenu,
  Fastfood,
  EventAvailable,
  ReceiptLong,
  Payment,
  ReportProblem,
  Notifications,
  SmartToy,
  Home,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: <Dashboard /> },
  { label: "PG Profile", path: "/pg", icon: <Home /> },
  { label: "Members", path: "/members", icon: <Groups /> },
  { label: "Meal Plans", path: "/meal-plans", icon: <RestaurantMenu /> },
  { label: "Meal Price", path: "/meal-price", icon: <Fastfood /> },
  { label: "Leave", path: "/leave", icon: <EventAvailable /> },
  { label: "Billing", path: "/billing", icon: <ReceiptLong /> },
  { label: "Payments", path: "/payments", icon: <Payment /> },
  { label: "Complaints", path: "/complaints", icon: <ReportProblem /> },
  { label: "Notifications", path: "/notifications", icon: <Notifications /> },
  { label: "AI Prediction", path: "/ai", icon: <SmartToy /> },
];

function Sidebar({ open, onClose, mobile = false }) {
  const location = useLocation();

  const content = (
    <Box sx={{ width: 260, bgcolor: "background.paper", height: "100%" }}>
      <Toolbar>
        <Typography variant="h6" fontWeight={700} color="primary.main">
          SmartPG
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              selected={active}
              onClick={mobile ? onClose : undefined}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  if (mobile) {
    return (
      <Drawer anchor="left" open={open} onClose={onClose}>
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer variant="permanent" open>
      {content}
    </Drawer>
  );
}

export default Sidebar;
