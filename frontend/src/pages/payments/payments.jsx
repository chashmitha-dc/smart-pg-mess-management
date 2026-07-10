import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
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
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Tooltip,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PrintIcon from "@mui/icons-material/Print";
import Autocomplete from "@mui/material/Autocomplete";
import toast from "react-hot-toast";

import { getPayments, createPayment, updatePayment } from "../../api/paymentApi";
import { getBills } from "../../api/billingApi";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [formData, setFormData] = useState({
    amount: "",
    payment_method: "Cash",
    transaction_reference: "",
    remarks: "",
  });

  // Receipt Preview
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [openReceiptDialog, setOpenReceiptDialog] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [payRes, billsRes] = await Promise.all([getPayments(), getBills()]);
      setPayments(payRes.data.data || []);
      setBills(billsRes.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load payment records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = async (paymentId, status) => {
    const action = status === "verified" ? "verify" : "reject";
    if (window.confirm(`Are you sure you want to ${action} this payment?`)) {
      setSaving(true);
      try {
        await updatePayment(paymentId, { verification_status: status });
        toast.success(`Payment status set to ${status}`);
        loadData();
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Verification action failed");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleBillSelect = (event, value) => {
    setSelectedBill(value);
    if (value) {
      setFormData((prev) => ({
        ...prev,
        amount: value.balance_amount,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        amount: "",
      }));
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!selectedBill) {
      toast.error("Please select a bill to pay");
      return false;
    }
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Amount must be greater than 0");
      return false;
    }
    if (amt > selectedBill.balance_amount) {
      toast.error(`Amount cannot exceed the bill balance of ₹${selectedBill.balance_amount}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      await createPayment({
        bill_id: selectedBill.bill_id,
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        transaction_reference: formData.transaction_reference,
        remarks: formData.remarks,
      });

      toast.success("Payment recorded successfully");
      setOpenAddDialog(false);
      setSelectedBill(null);
      setFormData({
        amount: "",
        payment_method: "Cash",
        transaction_reference: "",
        remarks: "",
      });
      loadData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  // Receipt printing
  const handlePrintReceipt = (payment) => {
    setSelectedReceipt(payment);
    setOpenReceiptDialog(true);
  };

  const executePrint = () => {
    const printContent = document.getElementById("receipt-print-area").innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>Receipt #${selectedReceipt.payment_id}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; text-align: center; }
            .receipt-box { max-width: 450px; margin: auto; border: 1.5px dashed #ccc; padding: 25px; border-radius: 6px; }
            .title { font-size: 1.5em; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
            .subtitle { font-size: 0.95em; color: #555; margin-bottom: 25px; }
            .details-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            .details-table td { padding: 10px 5px; text-align: left; border-bottom: 1px solid #eee; }
            .details-table td.label { color: #666; font-weight: 500; }
            .details-table td.value { text-align: right; font-weight: bold; }
            .footer { font-size: 0.85em; color: #888; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px; }
            .status { display: inline-block; padding: 4px 8px; background: #e8f5e9; color: #2e7d32; border-radius: 4px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            ${printContent}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || p.verification_status === statusFilter;
    const matchesMethod = methodFilter === "all" || p.payment_method === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const paginatedPayments = filteredPayments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const pendingBills = bills.filter((b) => b.balance_amount > 0);

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
        <Typography variant="h4" fontWeight="bold">
          Payment Transactions
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
          sx={{ borderRadius: 2 }}
        >
          Record Payment
        </Button>
      </Box>

      {/* Filter strip */}
      <Paper elevation={2} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search Member Name or Txn ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">All Verification Statuses</MenuItem>
              <MenuItem value="verified">Verified</MenuItem>
              <MenuItem value="pending">Pending Verification</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              size="small"
              label="Payment Method"
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">All Methods</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Payments list table */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Pay ID</b></TableCell>
                <TableCell><b>Bill ID</b></TableCell>
                <TableCell><b>Member Name</b></TableCell>
                <TableCell align="right"><b>Amount</b></TableCell>
                <TableCell><b>Method</b></TableCell>
                <TableCell><b>Date</b></TableCell>
                <TableCell><b>Txn Reference</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell align="center"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    No Payments Logged.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPayments.map((payment) => (
                  <TableRow key={payment.payment_id} hover>
                    <TableCell>{payment.payment_id}</TableCell>
                    <TableCell>{payment.bill_id}</TableCell>
                    <TableCell><b>{payment.member_name}</b></TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold", color: "#2e7d32" }}>
                      ₹{payment.amount}
                    </TableCell>
                    <TableCell>{payment.payment_method}</TableCell>
                    <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                    <TableCell>{payment.transaction_id || "N/A"}</TableCell>
                    <TableCell>
                      <Chip
                        label={payment.verification_status.toUpperCase()}
                        size="small"
                        color={
                          payment.verification_status === "verified"
                            ? "success"
                            : payment.verification_status === "rejected"
                            ? "error"
                            : "warning"
                        }
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        {payment.verification_status === "pending" && (
                          <>
                            <Tooltip title="Verify">
                              <IconButton
                                color="success"
                                size="small"
                                onClick={() => handleVerify(payment.payment_id, "verified")}
                                disabled={saving}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleVerify(payment.payment_id, "rejected")}
                                disabled={saving}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<PrintIcon />}
                          onClick={() => handlePrintReceipt(payment)}
                        >
                          Receipt
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPayments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Record Payment Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <DialogTitle fontWeight="bold">Record Manual Payment</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Autocomplete
                  options={pendingBills}
                  getOptionLabel={(option) =>
                    `${option.member_name} - Bill #${option.bill_id} (Bal: ₹${option.balance_amount})`
                  }
                  value={selectedBill}
                  onChange={handleBillSelect}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Bill to Pay" required fullWidth />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount Paid (₹)"
                  name="amount"
                  type="number"
                  inputProps={{ step: "0.01", min: "0.01" }}
                  value={formData.amount}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Payment Method"
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleFormChange}
                  required
                >
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Transaction Reference / UPI Ref ID"
                  name="transaction_reference"
                  value={formData.transaction_reference}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Remarks"
                  name="remarks"
                  multiline
                  rows={2}
                  value={formData.remarks}
                  onChange={handleFormChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenAddDialog(false)} color="inherit" disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="success" disabled={saving}>
              {saving ? "Saving..." : "Record Payment"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Print Receipt Dialog */}
      {selectedReceipt && (
        <Dialog open={openReceiptDialog} onClose={() => setOpenReceiptDialog(false)} maxWidth="xs">
          <DialogTitle fontWeight="bold">Receipt Preview</DialogTitle>
          <DialogContent>
            <div id="receipt-print-area">
              <div class="title">SMART PG MESS</div>
              <div class="subtitle">Official Payment Receipt</div>
              <table class="details-table">
                <tr>
                  <td class="label">Receipt ID</td>
                  <td class="value">REC-{selectedReceipt.payment_id}</td>
                </tr>
                <tr>
                  <td class="label">Member Name</td>
                  <td class="value">{selectedReceipt.member_name}</td>
                </tr>
                <tr>
                  <td class="label">Bill ID Reference</td>
                  <td class="value">BILL-{selectedReceipt.bill_id}</td>
                </tr>
                <tr>
                  <td class="label">Amount Paid</td>
                  <td class="value" style={{ color: "#2e7d32", fontSize: "1.15em" }}>
                    ₹{selectedReceipt.amount.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td class="label">Payment Method</td>
                  <td class="value">{selectedReceipt.payment_method}</td>
                </tr>
                <tr>
                  <td class="label">Transaction Ref</td>
                  <td class="value">{selectedReceipt.transaction_id || "N/A"}</td>
                </tr>
                <tr>
                  <td class="label">Date Logged</td>
                  <td class="value">
                    {new Date(selectedReceipt.payment_date).toLocaleDateString()}
                  </td>
                </tr>
                <tr>
                  <td class="label">Verification</td>
                  <td class="value">
                    <span class="status">{selectedReceipt.verification_status.toUpperCase()}</span>
                  </td>
                </tr>
              </table>
              <div class="footer">
                Thank you for your payment!<br />
                System Generated Electronic Receipt.
              </div>
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenReceiptDialog(false)} color="inherit">
              Close
            </Button>
            <Button variant="contained" startIcon={<PrintIcon />} onClick={executePrint}>
              Print Receipt
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

export default Payments;