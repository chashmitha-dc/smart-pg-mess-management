import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DownloadIcon from "@mui/icons-material/Download";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

import { getBills } from "../../api/billingApi";
import { getPayments } from "../../api/paymentApi";
import { getComplaints } from "../../api/complaintApi";
import { getAbsences } from "../../api/absenceApi";

function Reports() {
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("revenue"); // "revenue", "payments", "complaints", "leaves"

  const loadData = async () => {
    setLoading(true);
    try {
      const [billsRes, payRes, compRes, leaveRes] = await Promise.all([
        getBills(),
        getPayments(),
        getComplaints(),
        getAbsences(),
      ]);
      setBills(billsRes.data.data || []);
      setPayments(payRes.data.data || []);
      setComplaints(compRes.data.data || []);
      setLeaves(leaveRes.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Revenue data
  const totalBilled = bills.reduce((sum, b) => sum + b.final_amount, 0);
  const totalReceived = bills.reduce((sum, b) => sum + b.paid_amount, 0);
  const totalOutstanding = totalBilled - totalReceived;

  // Payments chart data
  const upiCount = payments.filter((p) => p.payment_method === "UPI").length;
  const cashCount = payments.filter((p) => p.payment_method === "Cash").length;
  const bankCount = payments.filter((p) => p.payment_method === "Bank Transfer").length;

  const pieData = [
    { name: "UPI", value: upiCount },
    { name: "Cash", value: cashCount },
    { name: "Bank Transfer", value: bankCount },
  ];
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  // Export reports to CSV
  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = "";

    if (reportType === "revenue") {
      filename = "revenue_report.csv";
      headers = ["Bill ID", "Member Name", "Billing Start", "Billing End", "Bill Amount", "Paid", "Balance Status"];
      rows = bills.map((b) => [
        b.bill_id,
        b.member_name,
        b.billing_period_start,
        b.billing_period_end,
        b.final_amount,
        b.paid_amount,
        b.status,
      ]);
    } else if (reportType === "payments") {
      filename = "payments_report.csv";
      headers = ["Payment ID", "Bill ID", "Member Name", "Amount", "Method", "Date", "Txn Reference", "Status"];
      rows = payments.map((p) => [
        p.payment_id,
        p.bill_id,
        p.member_name,
        p.amount,
        p.payment_method,
        p.payment_date,
        p.transaction_id,
        p.verification_status,
      ]);
    } else if (reportType === "complaints") {
      filename = "complaints_report.csv";
      headers = ["Complaint ID", "Member Name", "Category", "Description", "Date Created", "Status"];
      rows = complaints.map((c) => [
        c.complaint_id,
        c.member_name,
        c.category,
        c.description,
        c.created_at,
        c.status,
      ]);
    } else {
      filename = "leaves_report.csv";
      headers = ["Leave ID", "Member Name", "From Date", "To Date", "Reason", "Status"];
      rows = leaves.map((l) => [
        l.absence_id,
        l.member_name,
        l.from_date,
        l.to_date,
        l.reason,
        l.status,
      ]);
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report exported successfully");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center">
          <AssessmentIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" fontWeight="bold">
            Analytics & Reports
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExportCSV}>
          Export Selected CSV
        </Button>
      </Box>

      {/* Report selector */}
      <Paper elevation={2} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              size="small"
              label="Select Report Category"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="revenue">Revenue Report</MenuItem>
              <MenuItem value="payments">Payments Report</MenuItem>
              <MenuItem value="complaints">Complaints Report</MenuItem>
              <MenuItem value="leaves">Leaves Report</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {reportType === "revenue" && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: "#e3f2fd", borderRadius: 2 }}>
              <CardContent>
                <Typography color="text.secondary">Total Invoiced Amount</Typography>
                <Typography variant="h4" fontWeight="bold">
                  ₹{totalBilled.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: "#e8f5e9", borderRadius: 2 }}>
              <CardContent>
                <Typography color="text.secondary">Total Collected Cash/UPI</Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  ₹{totalReceived.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: "#ffeaf0", borderRadius: 2 }}>
              <CardContent>
                <Typography color="text.secondary">Outstanding Balances</Typography>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  ₹{totalOutstanding.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Bar chart */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Revenue Tracking (Billed vs Received)
              </Typography>
              <Box sx={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={[
                      {
                        name: "Overall",
                        Invoiced: totalBilled,
                        Collected: totalReceived,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Invoiced" fill="#1976d2" />
                    <Bar dataKey="Collected" fill="#2e7d32" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {reportType === "payments" && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: "#fafafa", borderRadius: 2 }}>
              <CardContent>
                <Typography color="text.secondary">Total Payments Count</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {payments.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Pie chart */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Payment Methods Distribution
              </Typography>
              <Box sx={{ width: "100%", height: 260, display: "flex", justifyContent: "center" }}>
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Detailed Report Table */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Typography variant="h6" fontWeight="bold" p={3} bgcolor="#fafafa">
          Detailed Report Log
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              {reportType === "revenue" && (
                <TableRow>
                  <TableCell><b>Bill ID</b></TableCell>
                  <TableCell><b>Member Name</b></TableCell>
                  <TableCell><b>Cycle Start</b></TableCell>
                  <TableCell><b>Cycle End</b></TableCell>
                  <TableCell align="right"><b>Final Amount</b></TableCell>
                  <TableCell align="right"><b>Paid</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                </TableRow>
              )}
              {reportType === "payments" && (
                <TableRow>
                  <TableCell><b>Payment ID</b></TableCell>
                  <TableCell><b>Member Name</b></TableCell>
                  <TableCell><b>Method</b></TableCell>
                  <TableCell align="right"><b>Amount</b></TableCell>
                  <TableCell><b>Date</b></TableCell>
                  <TableCell><b>Reference ID</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                </TableRow>
              )}
              {reportType === "complaints" && (
                <TableRow>
                  <TableCell><b>Complaint ID</b></TableCell>
                  <TableCell><b>Member Name</b></TableCell>
                  <TableCell><b>Category</b></TableCell>
                  <TableCell><b>Description</b></TableCell>
                  <TableCell><b>Date Created</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                </TableRow>
              )}
              {reportType === "leaves" && (
                <TableRow>
                  <TableCell><b>Leave ID</b></TableCell>
                  <TableCell><b>Member Name</b></TableCell>
                  <TableCell><b>From Date</b></TableCell>
                  <TableCell><b>To Date</b></TableCell>
                  <TableCell><b>Reason</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                </TableRow>
              )}
            </TableHead>
            <TableBody>
              {reportType === "revenue" &&
                bills.map((b) => (
                  <TableRow key={b.bill_id} hover>
                    <TableCell>{b.bill_id}</TableCell>
                    <TableCell><b>{b.member_name}</b></TableCell>
                    <TableCell>{new Date(b.billing_period_start).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(b.billing_period_end).toLocaleDateString()}</TableCell>
                    <TableCell align="right">₹{b.final_amount}</TableCell>
                    <TableCell align="right">₹{b.paid_amount}</TableCell>
                    <TableCell>{b.status.toUpperCase()}</TableCell>
                  </TableRow>
                ))}
              {reportType === "payments" &&
                payments.map((p) => (
                  <TableRow key={p.payment_id} hover>
                    <TableCell>{p.payment_id}</TableCell>
                    <TableCell><b>{p.member_name}</b></TableCell>
                    <TableCell>{p.payment_method}</TableCell>
                    <TableCell align="right">₹{p.amount}</TableCell>
                    <TableCell>{new Date(p.payment_date).toLocaleDateString()}</TableCell>
                    <TableCell>{p.transaction_id || "N/A"}</TableCell>
                    <TableCell>{p.verification_status.toUpperCase()}</TableCell>
                  </TableRow>
                ))}
              {reportType === "complaints" &&
                complaints.map((c) => (
                  <TableRow key={c.complaint_id} hover>
                    <TableCell>{c.complaint_id}</TableCell>
                    <TableCell><b>{c.member_name}</b></TableCell>
                    <TableCell>{c.category}</TableCell>
                    <TableCell>{c.description}</TableCell>
                    <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{c.status.toUpperCase()}</TableCell>
                  </TableRow>
                ))}
              {reportType === "leaves" &&
                leaves.map((l) => (
                  <TableRow key={l.absence_id} hover>
                    <TableCell>{l.absence_id}</TableCell>
                    <TableCell><b>{l.member_name}</b></TableCell>
                    <TableCell>{new Date(l.from_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(l.to_date).toLocaleDateString()}</TableCell>
                    <TableCell>{l.reason || "N/A"}</TableCell>
                    <TableCell>{l.status.toUpperCase()}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default Reports;
