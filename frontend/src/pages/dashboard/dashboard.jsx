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
    <Box sx={{ p: 1, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Premium Hero Welcome Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(59, 130, 246, 0.15)",
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
              Welcome Back, {owner?.name || "Manager"}!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 3, maxWidth: 500, lineHeight: 1.6, fontSize: { xs: "0.9rem", sm: "1rem" } }}>
              Keep your PG operations running seamlessly. Review occupancy status, financial records, pending complaints, and dining forecasts in real-time.
            </Typography>
            <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
              <Button
                variant="contained"
                onClick={() => navigate("/members")}
                sx={{
                  bgcolor: "white",
                  color: "#1e3a8a",
                  fontWeight: "bold",
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  width: { xs: "100%", sm: "auto" },
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
                Food Prediction Center
              </Button>
            </Box>
          </Grid>

        </Grid>
      </Card>

      {/* Billing Alerts Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3.5 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: dashboard?.due_billing_members?.length > 0 ? "#f59e0b" : "divider",
          background: dashboard?.due_billing_members?.length > 0 ? "linear-gradient(135deg, #fffbeb 0%, #fffbeb 100%)" : "white",
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography variant="h5" sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: "bold", fontSize: { xs: "1.25rem", sm: "1.5rem" }, color: dashboard?.due_billing_members?.length > 0 ? "#b45309" : "text.primary" }}>
              <span>🔔</span> Members Pending Billing
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="warning"
            onClick={handleGenerateAll}
            disabled={generatingBill || !dashboard?.due_billing_members || dashboard.due_billing_members.length === 0}
            sx={{ borderRadius: 2, fontWeight: "bold", width: { xs: "100%", sm: "auto" } }}
          >
            {generatingBill ? "Generating..." : "Generate All Due Bills"}
          </Button>
        </Box>
        <Divider sx={{ my: 1.5, borderColor: dashboard?.due_billing_members?.length > 0 ? "rgba(180, 83, 9, 0.15)" : "divider" }} />

        {!dashboard?.due_billing_members || dashboard.due_billing_members.length === 0 ? (
          <Box py={3} textAlign="center">
            <Typography color="text.secondary">
              All resident invoices are up to date. No pending billing cycles.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {dashboard.due_billing_members.map((member) => (
              <Grid item xs={12} sm={6} md={4} key={member.member_id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "rgba(180, 83, 9, 0.2)",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(180, 83, 9, 0.08)",
                      borderColor: "#d97706"
                    }
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                      {member.member_name}
                    </Typography>
                    <Typography variant="h6" fontWeight="800" color="#b45309">
                      ₹{member.due_amount.toFixed(2)}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="warning"
                    size="small"
                    onClick={() => handleGenerateSingle(member.member_id)}
                    disabled={generatingBill}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold" }}
                  >
                    Generate Bill
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Grid of Stats Cards */}
      <Grid container spacing={3}>
        {cardStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              elevation={0}
              onClick={() => navigate(stat.path)}
              sx={{
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                cursor: "pointer",
                background: "white",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 20px rgba(0, 0, 0, 0.06)",
                  borderColor: stat.borderColor,
                  "& .stat-icon-wrapper": {
                    transform: "scale(1.1)",
                    color: "white",
                    background: stat.color,
                  },
                },
              }}
            >
              <CardContent sx={{ p: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight="600" mb={0.5}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" fontWeight="800" color="text.primary" sx={{ letterSpacing: "-1px" }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Avatar
                  className="stat-icon-wrapper"
                  sx={{
                    width: 56,
                    height: 56,
                    color: stat.color,
                    background: stat.bgGradient,
                    transition: "all 0.3s ease",
                  }}
                >
                  {stat.icon}
                </Avatar>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bottom detailed charts and tables section */}
      <Grid container spacing={3}>
        {/* Prediction Display Card */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              background: "white",
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
                  <RestaurantIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  Tomorrow's AI Prediction
                </Typography>
              </Box>
              <Button size="small" onClick={() => navigate("/ai")}>
                Details
              </Button>
            </Box>
            <Divider sx={{ my: 1.5 }} />

            {dashboard?.prediction ? (
              <Box display="flex" flexDirection="column" gap={2} sx={{ flexGrow: 1, justifyContent: "center" }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  p={2}
                  sx={{
                    bgcolor: "rgba(59, 130, 246, 0.06)",
                    borderRadius: 3,
                    borderLeft: "5px solid #3b82f6",
                    transition: "all 0.2s ease",
                    "&:hover": { bgcolor: "rgba(59, 130, 246, 0.1)" },
                  }}
                >
                  <Typography fontWeight="600" color="text.primary">
                    Breakfast
                  </Typography>
                  <Typography fontWeight="800" color="#3b82f6" variant="h6">
                    {dashboard.prediction.breakfast} <span style={{ fontSize: "14px", fontWeight: "normal", color: "#666" }}>servings</span>
                  </Typography>
                </Box>

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  p={2}
                  sx={{
                    bgcolor: "rgba(16, 185, 129, 0.06)",
                    borderRadius: 3,
                    borderLeft: "5px solid #10b981",
                    transition: "all 0.2s ease",
                    "&:hover": { bgcolor: "rgba(16, 185, 129, 0.1)" },
                  }}
                >
                  <Typography fontWeight="600" color="text.primary">
                    Lunch
                  </Typography>
                  <Typography fontWeight="800" color="#10b981" variant="h6">
                    {dashboard.prediction.lunch} <span style={{ fontSize: "14px", fontWeight: "normal", color: "#666" }}>servings</span>
                  </Typography>
                </Box>

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  p={2}
                  sx={{
                    bgcolor: "rgba(245, 158, 11, 0.06)",
                    borderRadius: 3,
                    borderLeft: "5px solid #f59e0b",
                    transition: "all 0.2s ease",
                    "&:hover": { bgcolor: "rgba(245, 158, 11, 0.1)" },
                  }}
                >
                  <Typography fontWeight="600" color="text.primary">
                    Dinner
                  </Typography>
                  <Typography fontWeight="800" color="#f59e0b" variant="h6">
                    {dashboard.prediction.dinner} <span style={{ fontSize: "14px", fontWeight: "normal", color: "#666" }}>servings</span>
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
        </Grid>

        {/* Transactions Chart Card */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              background: "white",
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar sx={{ bgcolor: "success.main", width: 40, height: 40 }}>
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
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;