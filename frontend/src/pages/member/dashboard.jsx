import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
} from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DateRangeIcon from "@mui/icons-material/DateRange";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";
import { getBills } from "../../api/billingApi";
import { getAbsences } from "../../api/absenceApi";
import { getNotifications } from "../../api/notificationApi";

function MemberDashboard() {
  const navigate = useNavigate();
  const { member } = useAuth();

  const [bills, setBills] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [billsRes, leavesRes, notifRes] = await Promise.all([
        getBills(),
        getAbsences(),
        getNotifications(),
      ]);

      setBills(billsRes.data.data || []);
      setLeaves(leavesRes.data.data || []);
      setNotifications(notifRes.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress color="secondary" size={50} thickness={4} />
      </Box>
    );
  }

  // Calculate unpaid balance dues
  const unpaidBills = bills.filter((b) => b.status !== "paid");
  const totalDues = unpaidBills.reduce((sum, b) => sum + b.balance_amount, 0);

  // Filter leaves and announcements
  const activeLeaves = leaves.slice(0, 3);
  const activeNotifications = notifications.slice(0, 3);

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Premium Hero Welcome Card for Member */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 1.25,
          background: "linear-gradient(135deg, #701a75 0%, #ec4899 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(236, 72, 153, 0.15)",
        }}
      >
        {/* Abstract shapes for design decoration */}
        <Box
          sx={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.07)",
            filter: "blur(20px)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -50,
            left: "20%",
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.05)",
            filter: "blur(15px)",
            pointerEvents: "none",
          }}
        />

        <Grid container alignItems="center" spacing={2} sx={{ p: { xs: 3, md: 4 } }}>
          <Grid item xs={12} md={7} sx={{ zIndex: 2 }}>
            <Typography variant="h4" fontWeight="800" sx={{ mb: 1, letterSpacing: "-0.5px", fontSize: { xs: "1.75rem", sm: "2.125rem" } }}>
              Welcome, {member?.member_name || "Resident"}!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 3, maxWidth: 500, lineHeight: 1.6, fontSize: { xs: "0.9rem", sm: "1rem" } }}>
              Welcome to your personal resident dashboard. Check your leaves status, clear billing dues, and read the latest announcements from your PG owner here.
            </Typography>
            <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
              <Button
                variant="contained"
                onClick={() => navigate("/member/leaves")}
                sx={{
                  bgcolor: "white",
                  color: "#701a75",
                  fontWeight: "bold",
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  width: { xs: "100%", sm: "auto" },
                  "&:hover": {
                    bgcolor: "#fdf2f8",
                  },
                }}
              >
                Apply Leave
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/member/bills")}
                sx={{
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  width: { xs: "100%", sm: "auto" },
                  "&:hover": {
                    borderColor: "white",
                    background: "rgba(255, 255, 255, 0.05)",
                  },
                }}
              >
                View Bills
              </Button>
            </Box>
          </Grid>

        </Grid>
      </Card>

      {/* Grid containing Dues, Leaves, and Announcements Side-by-Side */}
      <Grid container spacing={3}>
        {/* Outstanding Dues */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: 1.25,
              border: "1px solid",
              borderColor: "divider",
              minHeight: 330,
              display: "flex",
              flexDirection: "column",
              background: "white",
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <Avatar sx={{ bgcolor: "rgba(239, 68, 68, 0.1)", width: 40, height: 40 }}>
                <ReceiptIcon sx={{ color: "#ef4444" }} />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                Mess Balance Fees
              </Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", py: 2 }}>
              <Typography variant="h3" fontWeight="800" color={totalDues > 0 ? "error.main" : "success.main"} sx={{ letterSpacing: "-1px" }}>
                ₹{totalDues.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1} align="center">
                {totalDues > 0 ? "Pending outstanding balance fees due for payment" : "All clean! No outstanding balance fees."}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color={totalDues > 0 ? "error" : "primary"}
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate("/member/bills")}
              fullWidth
              sx={{ py: 1.2, borderRadius: 2 }}
            >
              Pay Dues
            </Button>
          </Paper>
        </Grid>

        {/* Leave Absences Status */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: 1.25,
              border: "1px solid",
              borderColor: "divider",
              minHeight: 330,
              display: "flex",
              flexDirection: "column",
              background: "white",
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar sx={{ bgcolor: "rgba(245, 158, 11, 0.1)", width: 40, height: 40 }}>
                  <DateRangeIcon sx={{ color: "#f59e0b" }} />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  Leave Requests
                </Typography>
              </Box>
              <Button size="small" onClick={() => navigate("/member/leaves")}>
                View All
              </Button>
            </Box>
            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
              {activeLeaves.length > 0 ? (
                <List disablePadding>
                  {activeLeaves.map((leave, idx) => (
                    <ListItem key={leave.absence_id} sx={{ px: 0, py: 1, borderBottom: idx < activeLeaves.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <ListItemText
                        primary={leave.reason || "General absence leave"}
                        secondary={`${new Date(leave.from_date).toLocaleDateString()} - ${new Date(leave.to_date).toLocaleDateString()}`}
                        primaryTypographyProps={{ fontWeight: "600", fontSize: "14px", noWrap: true }}
                      />
                      <Chip
                        label={leave.status.toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "10px",
                          bgcolor: leave.status === "approved" ? "#ecfdf5" : leave.status === "rejected" ? "#fef2f2" : "#fffbeb",
                          color: leave.status === "approved" ? "#10b981" : leave.status === "rejected" ? "#ef4444" : "#f59e0b",
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box py={4} textAlign="center" sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1 }}>
                  <Typography color="text.secondary" mb={2}>
                    No leave requests logged yet.
                  </Typography>
                  <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => navigate("/member/leaves")}>
                    Request Leave
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Notifications & Announcements Feed */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: 1.25,
              border: "1px solid",
              borderColor: "divider",
              minHeight: 330,
              display: "flex",
              flexDirection: "column",
              background: "white",
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar sx={{ bgcolor: "rgba(16, 185, 129, 0.1)", width: 40, height: 40 }}>
                  <NotificationsIcon sx={{ color: "#10b981" }} />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  Announcements
                </Typography>
              </Box>
              <Button size="small" onClick={() => navigate("/member/notifications")}>
                View All
              </Button>
            </Box>
            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
              {activeNotifications.length > 0 ? (
                <List disablePadding>
                  {activeNotifications.map((notif, idx) => (
                    <ListItem key={notif.notification_id} sx={{ px: 0, py: 1, borderBottom: idx < activeNotifications.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <ListItemText
                        primary={notif.title}
                        secondary={notif.message}
                        primaryTypographyProps={{ fontWeight: "600", fontSize: "14px", noWrap: true }}
                        secondaryTypographyProps={{ sx: { display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", fontSize: "12px" } }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1, whiteSpace: "nowrap" }}>
                        {new Date(notif.created_at).toLocaleDateString()}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box py={4} textAlign="center" sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1 }}>
                  <Typography color="text.secondary">
                    No new announcements from management.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default MemberDashboard;
