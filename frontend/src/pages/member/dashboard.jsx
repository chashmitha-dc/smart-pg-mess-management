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
  useMediaQuery,
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
  const isMobile = useMediaQuery("(max-width:767.95px)");

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
    <Box sx={{ p: { xs: 2, sm: 2.5, md: 4 }, display: "flex", flexDirection: "column", gap: { xs: 2.5, md: 3 }, width: "100%", boxSizing: "border-box" }}>
      {isMobile ? (
        /* Compact Crisp Rectangular Mobile Hero Card (<768px) */
        <Card
          elevation={0}
          sx={{
            width: "100%",
            boxSizing: "border-box",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #701a75 0%, #ec4899 100%)",
            color: "white",
            p: { xs: 2.5, sm: 3 },
            boxShadow: "0 4px 16px rgba(112, 26, 117, 0.15)",
          }}
        >
          <Typography
            variant="h6"
            fontWeight="800"
            sx={{ fontSize: "1.15rem", letterSpacing: "-0.3px", mb: 0.5 }}
          >
            Welcome, {member?.member_name || "Resident"}
          </Typography>
          <Typography
            variant="body2"
            sx={{ opacity: 0.9, mb: 2, fontSize: "0.825rem", lineHeight: 1.4 }}
          >
            Check your leaves status, clear billing dues & read announcements.
          </Typography>
          <Box display="flex" flexDirection="column" gap="12px" sx={{ width: "100%" }}>
            <Button
              variant="contained"
              onClick={() => navigate("/member/leaves")}
              sx={{
                bgcolor: "white",
                color: "#701a75",
                fontWeight: "700",
                borderRadius: "6px",
                height: "46px",
                width: "100%",
                fontSize: "0.875rem",
                textTransform: "none",
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
                fontWeight: "700",
                borderRadius: "6px",
                height: "46px",
                width: "100%",
                fontSize: "0.875rem",
                textTransform: "none",
                "&:hover": {
                  borderColor: "white",
                  background: "rgba(255, 255, 255, 0.08)",
                },
              }}
            >
              View Bills
            </Button>
          </Box>
        </Card>
      ) : (
        /* Desktop Crisp Rectangular Hero Welcome Card (>=768px) */
        <Card
          elevation={0}
          sx={{
            width: "100%",
            boxSizing: "border-box",
            borderRadius: "8px",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
                : "linear-gradient(135deg, #701a75 0%, #ec4899 100%)",
            border: (theme) => (theme.palette.mode === "dark" ? "1px solid #334155" : "none"),
            color: "white",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(236, 72, 153, 0.15)",
          }}
        >
          <Grid container alignItems="center" spacing={2} sx={{ p: 4 }}>
            <Grid item xs={12} md={7} sx={{ zIndex: 2 }}>
              <Typography variant="h4" fontWeight="800" sx={{ mb: 1, letterSpacing: "-0.5px" }}>
                Welcome, {member?.member_name || "Resident"}!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 3, maxWidth: 500, lineHeight: 1.6 }}>
                Welcome to your personal resident dashboard. Check your leaves status, clear billing dues, and read the latest announcements from your PG owner here.
              </Typography>
              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  onClick={() => navigate("/member/leaves")}
                  sx={{
                    bgcolor: "white",
                    color: "#701a75",
                    fontWeight: "bold",
                    borderRadius: "6px",
                    px: 3,
                    py: 1,
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
                    borderRadius: "6px",
                    px: 3,
                    py: 1,
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
      )}

      {/* Full-Width Stacked Cards on Mobile (<768px) and 3-Column Grid on Desktop (>=768px) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: { xs: 2.5, md: 3 },
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Outstanding Dues Card */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            boxSizing: "border-box",
            p: { xs: 2.5, sm: 3 },
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "divider",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            bgcolor: "background.paper",
            boxShadow: (theme) =>
              theme.palette.mode === "dark" ? "0 4px 16px rgba(0,0,0,0.25)" : "0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <Box mb={2}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
              <Avatar sx={{ bgcolor: "rgba(239, 68, 68, 0.1)", width: 40, height: 40, borderRadius: "6px", flexShrink: 0 }}>
                <ReceiptIcon sx={{ color: "#ef4444", fontSize: 22 }} />
              </Avatar>
              <Typography variant="h6" fontWeight="700" sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                Mess Balance Fees
              </Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ py: 1.5, textAlign: "center" }}>
              <Typography variant="h3" fontWeight="800" color={totalDues > 0 ? "error.main" : "success.main"} sx={{ letterSpacing: "-0.5px", fontSize: { xs: "2rem", sm: "2.5rem" } }}>
                ₹{totalDues.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5} align="center" sx={{ fontSize: { xs: "0.85rem", sm: "0.875rem" } }}>
                {totalDues > 0 ? "Pending outstanding balance fees due for payment" : "All clean! No outstanding balance fees."}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            color={totalDues > 0 ? "error" : "primary"}
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate("/member/bills")}
            fullWidth
            sx={{ height: "46px", borderRadius: "6px", fontWeight: "bold", fontSize: "0.875rem", mt: "auto", textTransform: "none" }}
          >
            Pay Dues
          </Button>
        </Paper>

        {/* Leave Absences Card */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            boxSizing: "border-box",
            p: { xs: 2.5, sm: 3 },
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "divider",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            bgcolor: "background.paper",
            boxShadow: (theme) =>
              theme.palette.mode === "dark" ? "0 4px 16px rgba(0,0,0,0.25)" : "0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }} mb={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar sx={{ bgcolor: "rgba(245, 158, 11, 0.1)", width: 40, height: 40, borderRadius: "6px", flexShrink: 0 }}>
                  <DateRangeIcon sx={{ color: "#f59e0b", fontSize: 22 }} />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                  Leave Requests
                </Typography>
              </Box>
              <Button size="small" onClick={() => navigate("/member/leaves")} sx={{ fontWeight: "600" }}>
                View All
              </Button>
            </Box>
            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {activeLeaves.length > 0 ? (
                <List disablePadding>
                  {activeLeaves.slice(0, 3).map((leave, idx) => (
                    <ListItem key={leave.absence_id} sx={{ px: 0, py: 1, borderBottom: idx < Math.min(activeLeaves.length, 3) - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <ListItemText
                        primary={leave.reason || "General absence"}
                        secondary={`${new Date(leave.from_date).toLocaleDateString()} - ${new Date(leave.to_date).toLocaleDateString()}`}
                        primaryTypographyProps={{ fontWeight: "600", fontSize: "14px" }}
                        secondaryTypographyProps={{ fontSize: "12px" }}
                      />
                      <Chip
                        label={leave.status.toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "10px",
                          borderRadius: "4px",
                          ml: 1,
                          whiteSpace: "nowrap",
                          bgcolor: leave.status === "approved" ? "#ecfdf5" : leave.status === "rejected" ? "#fef2f2" : "#fffbeb",
                          color: leave.status === "approved" ? "#10b981" : leave.status === "rejected" ? "#ef4444" : "#f59e0b",
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box py={3} textAlign="center" sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1 }}>
                  <Typography color="text.secondary" sx={{ fontSize: "0.875rem" }} mb={1.5}>
                    No leave requests logged yet.
                  </Typography>
                  <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => navigate("/member/leaves")}>
                    Request Leave
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate("/member/leaves")}
            fullWidth
            sx={{ height: "46px", borderRadius: "6px", fontWeight: "bold", fontSize: "0.875rem", mt: "auto", textTransform: "none" }}
          >
            Manage Leaves
          </Button>
        </Paper>

        {/* Announcements Card */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            boxSizing: "border-box",
            p: { xs: 2.5, sm: 3 },
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "divider",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            bgcolor: "background.paper",
            boxShadow: (theme) =>
              theme.palette.mode === "dark" ? "0 4px 16px rgba(0,0,0,0.25)" : "0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }} mb={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar sx={{ bgcolor: "rgba(16, 185, 129, 0.1)", width: 40, height: 40, borderRadius: "6px", flexShrink: 0 }}>
                  <NotificationsIcon sx={{ color: "#10b981", fontSize: 22 }} />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                  Announcements
                </Typography>
              </Box>
              <Button size="small" onClick={() => navigate("/member/notifications")} sx={{ fontWeight: "600" }}>
                View All
              </Button>
            </Box>
            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {activeNotifications.length > 0 ? (
                <List disablePadding>
                  {activeNotifications.slice(0, 3).map((notif, idx) => (
                    <ListItem key={notif.notification_id} sx={{ px: 0, py: 1, borderBottom: idx < Math.min(activeNotifications.length, 3) - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <ListItemText
                        primary={notif.title}
                        secondary={notif.message}
                        primaryTypographyProps={{ fontWeight: "600", fontSize: "14px" }}
                        secondaryTypographyProps={{ sx: { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontSize: "12px" } }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1, whiteSpace: "nowrap" }}>
                        {new Date(notif.created_at).toLocaleDateString()}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box py={3} textAlign="center" sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1 }}>
                  <Typography color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                    No new announcements from management.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate("/member/notifications")}
            fullWidth
            sx={{ height: "46px", borderRadius: "6px", fontWeight: "bold", fontSize: "0.875rem", mt: "auto", textTransform: "none" }}
          >
            All Notifications
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}

export default MemberDashboard;
