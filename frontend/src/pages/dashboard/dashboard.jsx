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
  Avatar,
  useTheme,
  Button,
  useMediaQuery,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, AreaChart, Area } from "recharts";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { getDashboard } from "../../api/dashboardApi";
import { getPayments } from "../../api/paymentApi";
import { generateMemberBill, generateAllBills } from "../../api/billingApi";
import { useAuth } from "../../hooks/useAuth";

function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { owner } = useAuth();
  const isMobile = useMediaQuery("(max-width:767.95px)");
  const [dashboard, setDashboard] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingBill, setGeneratingBill] = useState(false);

  const handleGenerateSingle = async (memberId) => {
    setGeneratingBill(true);
    try {
      await generateMemberBill(memberId);
      toast.success("Bill generated successfully and member notified!");
      loadDashboard();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to generate bill");
    } finally {
      setGeneratingBill(false);
    }
  };

  const handleGenerateAll = async () => {
    setGeneratingBill(true);
    try {
      await generateAllBills();
      toast.success("All due bills generated successfully and members notified!");
      loadDashboard();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to generate due bills");
    } finally {
      setGeneratingBill(false);
    }
  };

  const loadDashboard = async () => {
    try {
      const [dashRes, payRes] = await Promise.all([getDashboard(), getPayments()]);
      setDashboard(dashRes.data.data);
      setPayments(payRes.data.data || []);
    } catch (error) {
      console.error("Dashboard Error:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          height: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={50} thickness={4} />
      </Box>
    );
  }

  // Group payments by date for charts
  const paymentChartData = [...payments]
    .slice(0, 8)
    .reverse()
    .map((p) => ({
      date: new Date(p.payment_date).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
      Amount: p.amount,
    }));

  const cardStats = [
    {
      title: "Active Residents",
      value: dashboard?.total_members ?? 0,
      icon: <PeopleIcon sx={{ fontSize: 32 }} />,
      color: "#3b82f6",
      bgGradient: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
      borderColor: "#3b82f6",
      path: "/members",
    },
    {
      title: "Total Revenue",
      value: `₹${(dashboard?.total_revenue ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <PaymentsIcon sx={{ fontSize: 32 }} />,
      color: "#10b981",
      bgGradient: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
      borderColor: "#10b981",
      path: "/payments",
    },
    {
      title: "Unpaid Bills",
      value: dashboard?.pending_bills ?? 0,
      icon: <ReceiptLongIcon sx={{ fontSize: 32 }} />,
      color: "#f59e0b",
      bgGradient: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
      borderColor: "#f59e0b",
      path: "/billing",
    },
    {
      title: "Open Complaints",
      value: dashboard?.open_complaints ?? 0,
      icon: <ReportProblemIcon sx={{ fontSize: 32 }} />,
      color: "#ef4444",
      bgGradient: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
      borderColor: "#ef4444",
      path: "/complaints",
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, display: "flex", flexDirection: "column", gap: { xs: 2.5, md: 3 }, width: "100%", boxSizing: "border-box" }}>
      {isMobile ? (
        /* Crisp Rectangular Mobile Hero Card (<768px) */
        <Card
          elevation={0}
          sx={{
            width: "100%",
            boxSizing: "border-box",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
            color: "white",
            p: { xs: 2.5, sm: 3 },
            boxShadow: "0 4px 16px rgba(30, 58, 138, 0.15)",
          }}
        >
          <Typography
            variant="h6"
            fontWeight="800"
            sx={{ fontSize: "1.15rem", letterSpacing: "-0.3px", mb: 0.5 }}
          >
            Welcome Back, {owner?.name || "Manager"}
          </Typography>
          <Typography
            variant="body2"
            sx={{ opacity: 0.9, mb: 2, fontSize: "0.825rem", lineHeight: 1.4 }}
          >
            Review occupancy, financial records & dining forecasts in real-time.
          </Typography>
          <Box display="flex" flexDirection="column" gap="12px" sx={{ width: "100%" }}>
            <Button
              variant="contained"
              onClick={() => navigate("/members")}
              sx={{
                bgcolor: "white",
                color: "#1e3a8a",
                fontWeight: "700",
                borderRadius: "6px",
                height: "46px",
                width: "100%",
                fontSize: "0.875rem",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#f8fafc",
                },
              }}
            >
              Manage Residents
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/ai")}
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
              Food Prediction Center
            </Button>
          </Box>
        </Card>
      ) : (
        /* Desktop Rectangular Hero Welcome Card (>=768px) */
        <Card
          elevation={0}
          sx={{
            width: "100%",
            boxSizing: "border-box",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(59, 130, 246, 0.15)",
          }}
        >
          <Grid container alignItems="center" spacing={2} sx={{ p: 4 }}>
            <Grid item xs={12} md={7} sx={{ zIndex: 2 }}>
              <Typography variant="h4" fontWeight="800" sx={{ mb: 1, letterSpacing: "-0.5px" }}>
                Welcome Back, {owner?.name || "Manager"}!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 3, maxWidth: 500, lineHeight: 1.6 }}>
                Keep your PG operations running seamlessly. Review occupancy status, financial records, pending complaints, and dining forecasts in real-time.
              </Typography>
              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  onClick={() => navigate("/members")}
                  sx={{
                    bgcolor: "white",
                    color: "#1e3a8a",
                    fontWeight: "bold",
                    borderRadius: "6px",
                    px: 3,
                    py: 1,
                    "&:hover": {
                      bgcolor: "#f8fafc",
                    },
                  }}
                >
                  Manage Residents
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/ai")}
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
                  Food Prediction Center
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* Billing Alerts Section */}
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          boxSizing: "border-box",
          p: { xs: 2.5, sm: 3, md: 3.5 },
          borderRadius: "8px",
          border: "1px solid",
          borderColor: dashboard?.due_billing_members?.length > 0 ? "#f59e0b" : "divider",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? dashboard?.due_billing_members?.length > 0
                ? "rgba(245, 158, 11, 0.1)"
                : theme.palette.background.paper
              : dashboard?.due_billing_members?.length > 0
              ? "linear-gradient(135deg, #fffbeb 0%, #fffbeb 100%)"
              : theme.palette.background.paper,
          boxShadow: (theme) =>
            theme.palette.mode === "dark" ? "0 4px 16px rgba(0,0,0,0.25)" : "0 4px 16px rgba(0,0,0,0.04)",
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1.5}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography variant="h5" sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: "bold", fontSize: { xs: "1.1rem", sm: "1.35rem" }, color: dashboard?.due_billing_members?.length > 0 ? "#f59e0b" : "text.primary" }}>
              <span>🔔</span> Members Pending Billing
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="warning"
            onClick={handleGenerateAll}
            disabled={generatingBill || !dashboard?.due_billing_members || dashboard.due_billing_members.length === 0}
            sx={{ height: "44px", borderRadius: "6px", fontWeight: "bold", width: { xs: "100%", sm: "auto" } }}
          >
            {generatingBill ? "Generating..." : "Generate All Due Bills"}
          </Button>
        </Box>
        <Divider sx={{ my: 1.5, borderColor: dashboard?.due_billing_members?.length > 0 ? "rgba(245, 158, 11, 0.25)" : "divider" }} />

        {!dashboard?.due_billing_members || dashboard.due_billing_members.length === 0 ? (
          <Box py={3} textAlign="center">
            <Typography color="text.secondary">
              All resident invoices are up to date. No pending billing cycles.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 2.5, sm: 2.5, md: 3 }}>
            {dashboard.due_billing_members.map((member) => (
              <Grid item xs={12} sm={6} md={4} key={member.member_id}>
                <Paper
                  elevation={0}
                  sx={{
                    width: "100%",
                    boxSizing: "border-box",
                    p: 2,
                    borderRadius: "6px",
                    border: "1px solid",
                    borderColor: "rgba(245, 158, 11, 0.3)",
                    bgcolor: "background.paper",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(245, 158, 11, 0.15)",
                      borderColor: "#f59e0b"
                    }
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                      {member.member_name}
                    </Typography>
                    <Typography variant="h6" fontWeight="800" color="#f59e0b">
                      ₹{member.due_amount.toFixed(2)}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="warning"
                    size="small"
                    onClick={() => handleGenerateSingle(member.member_id)}
                    disabled={generatingBill}
                    sx={{ borderRadius: "6px", textTransform: "none", fontWeight: "bold" }}
                  >
                    Generate Bill
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* 2-Column CSS Grid of Stats Cards on Mobile (<768px) and 4-Column on Desktop (>=768px) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
          gap: "16px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {cardStats.map((stat, index) => (
          <Card
            key={index}
            elevation={0}
            onClick={() => navigate(stat.path)}
            sx={{
              width: "100%",
              boxSizing: "border-box",
              height: "100%",
              borderRadius: "8px",
              border: "1px solid",
              borderColor: "divider",
              cursor: "pointer",
              bgcolor: "background.paper",
              boxShadow: (theme) =>
                theme.palette.mode === "dark" ? "0 4px 16px rgba(0,0,0,0.25)" : "0 4px 16px rgba(0,0,0,0.04)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: (theme) =>
                  theme.palette.mode === "dark" ? "0 8px 16px rgba(0, 0, 0, 0.4)" : "0 8px 16px rgba(0, 0, 0, 0.08)",
                borderColor: stat.borderColor,
                "& .stat-icon-wrapper": {
                  transform: "scale(1.05)",
                  color: "white",
                  background: stat.color,
                },
              },
            }}
          >
            <CardContent
              sx={{
                p: { xs: 1.75, sm: 2.5, md: 3 },
                "&:last-child": { pb: { xs: 1.75, sm: 2.5, md: 3 } },
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: "100%",
                boxSizing: "border-box",
                minWidth: 0,
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1, mr: 1 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight="600"
                  sx={{
                    fontSize: { xs: "0.75rem", sm: "0.85rem", md: "0.875rem" },
                    lineHeight: 1.25,
                    mb: 0.5,
                  }}
                >
                  {stat.title}
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="800"
                  color="text.primary"
                  sx={{
                    letterSpacing: "-0.5px",
                    fontSize: { xs: "1.05rem", sm: "1.35rem", md: "1.75rem" },
                    lineHeight: 1.1,
                    wordBreak: "break-word",
                  }}
                >
                  {stat.value}
                </Typography>
              </Box>
              <Avatar
                className="stat-icon-wrapper"
                sx={{
                  width: { xs: 38, sm: 48 },
                  height: { xs: 38, sm: 48 },
                  flexShrink: 0,
                  borderRadius: "6px",
                  color: stat.color,
                  background: stat.bgGradient,
                  transition: "all 0.3s ease",
                  "& .MuiSvgIcon-root": { fontSize: { xs: 20, sm: 28 } },
                }}
              >
                {stat.icon}
              </Avatar>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Bottom detailed charts section: 1-Column on Mobile (<768px) and 5fr 7fr Grid on Desktop (>=768px) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" },
          gap: "16px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Prediction Display Card */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            boxSizing: "border-box",
            p: { xs: 2.5, sm: 3, md: 3.5 },
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "divider",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.paper",
            boxShadow: (theme) =>
              theme.palette.mode === "dark" ? "0 4px 16px rgba(0,0,0,0.25)" : "0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40, borderRadius: "6px", flexShrink: 0 }}>
                <RestaurantIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                Tomorrow's AI Prediction
              </Typography>
            </Box>
            <Button size="small" onClick={() => navigate("/ai")}>
              Details
            </Button>
          </Box>
          <Divider sx={{ my: 1.5 }} />

          {dashboard?.prediction ? (
            <Box display="flex" flexDirection="column" gap={1.5} sx={{ width: "100%", flexGrow: 1, justifyContent: "center" }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                p={{ xs: 1.5, sm: 2 }}
                sx={{
                  width: "100%",
                  boxSizing: "border-box",
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.06)"),
                  borderRadius: "6px",
                  borderLeft: "5px solid #3b82f6",
                  transition: "all 0.2s ease",
                  "&:hover": { bgcolor: "rgba(59, 130, 246, 0.2)" },
                }}
              >
                <Typography fontWeight="600" color="text.primary" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                  Breakfast
                </Typography>
                <Typography fontWeight="800" color="#3b82f6" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                  {dashboard.prediction.breakfast} <span style={{ fontSize: "13px", fontWeight: "normal", color: "#94a3b8" }}>servings</span>
                </Typography>
              </Box>

              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                p={{ xs: 1.5, sm: 2 }}
                sx={{
                  width: "100%",
                  boxSizing: "border-box",
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.06)"),
                  borderRadius: "6px",
                  borderLeft: "5px solid #10b981",
                  transition: "all 0.2s ease",
                  "&:hover": { bgcolor: "rgba(16, 185, 129, 0.2)" },
                }}
              >
                <Typography fontWeight="600" color="text.primary" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                  Lunch
                </Typography>
                <Typography fontWeight="800" color="#10b981" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                  {dashboard.prediction.lunch} <span style={{ fontSize: "13px", fontWeight: "normal", color: "#94a3b8" }}>servings</span>
                </Typography>
              </Box>

              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                p={{ xs: 1.5, sm: 2 }}
                sx={{
                  width: "100%",
                  boxSizing: "border-box",
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(245, 158, 11, 0.15)" : "rgba(245, 158, 11, 0.06)"),
                  borderRadius: "6px",
                  borderLeft: "5px solid #f59e0b",
                  transition: "all 0.2s ease",
                  "&:hover": { bgcolor: "rgba(245, 158, 11, 0.2)" },
                }}
              >
                <Typography fontWeight="600" color="text.primary" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                  Dinner
                </Typography>
                <Typography fontWeight="800" color="#f59e0b" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                  {dashboard.prediction.dinner} <span style={{ fontSize: "13px", fontWeight: "normal", color: "#94a3b8" }}>servings</span>
                </Typography>
              </Box>

              <Typography variant="caption" color="text.secondary" align="right" sx={{ mt: 1 }}>
                Forecast Date: {new Date(dashboard.prediction.date).toLocaleDateString()}
              </Typography>
            </Box>
          ) : (
            <Box py={6} textAlign="center" sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1 }}>
              <Typography color="text.secondary" mb={2}>
                No tomorrow prediction values available yet.
              </Typography>
              <Button variant="outlined" size="small" onClick={() => navigate("/ai")}>
                Generate Now
              </Button>
            </Box>
          )}
        </Paper>

        {/* Transactions Chart Card */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            boxSizing: "border-box",
            p: { xs: 2.5, sm: 3, md: 3.5 },
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: (theme) =>
              theme.palette.mode === "dark" ? "0 4px 16px rgba(0,0,0,0.25)" : "0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar sx={{ bgcolor: "success.main", width: 40, height: 40, borderRadius: "6px" }}>
                <TrendingUpIcon sx={{ fontSize: 20, color: "white" }} />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                Recent Revenue Flow
              </Typography>
            </Box>
            <Button size="small" onClick={() => navigate("/payments")}>
              All Transactions
            </Button>
          </Box>
          <Divider sx={{ my: 1.5 }} />

          {paymentChartData.length > 0 ? (
            <Box sx={{ width: "100%", height: 265, pt: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip cursor={{ fill: "rgba(226, 232, 240, 0.4)" }} />
                  <Legend iconType="circle" />
                  <Bar dataKey="Amount" name="Revenue (₹)" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box py={8} textAlign="center">
              <Typography color="text.secondary">
                No payment records generated or verified.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default Dashboard;