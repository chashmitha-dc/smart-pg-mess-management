import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
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
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import PaymentsIcon from "@mui/icons-material/Payments";
import toast from "react-hot-toast";

import { getBills } from "../../api/billingApi";
import { createPayment } from "../../api/paymentApi";
import { getPGDetails } from "../../api/pgApi";

function MemberBills() {
  const [bills, setBills] = useState([]);
  const [pg, setPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialogs
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);

  const [payBill, setPayBill] = useState(null);
  const [openPayDialog, setOpenPayDialog] = useState(false);
  const [formData, setFormData] = useState({
    transaction_reference: "",
    remarks: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [billsRes, pgRes] = await Promise.all([getBills(), getPGDetails()]);
      setBills(billsRes.data.data || []);
      setPg(pgRes.data.data || null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrint = (bill) => {
    setSelectedInvoice(bill);
    setOpenInvoiceDialog(true);
  };

  const handleOpenPay = (bill) => {
    setPayBill(bill);
    setFormData({
      transaction_reference: "",
      remarks: "",
    });
    setOpenPayDialog(true);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!formData.transaction_reference.trim()) {
      toast.error("Transaction Reference ID is required");
      return;
    }

    setSubmitting(true);
    try {
      await createPayment({
        bill_id: payBill.bill_id,
        amount: payBill.balance_amount,
        payment_method: "UPI",
        transaction_reference: formData.transaction_reference,
        remarks: formData.remarks,
      });

      toast.success("Payment reference submitted for verification!");
      setOpenPayDialog(false);
      setPayBill(null);
      loadData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Payment submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const executePrint = () => {
    const printContent = document.getElementById("invoice-print-area").innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>Invoice #${selectedInvoice.bill_id}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #333; }
            .invoice-box { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, .15); }
            .header-table { width: 100%; margin-bottom: 30px; border-collapse: collapse; }
            .bold { font-weight: bold; }
            .right-align { text-align: right; }
            .line-items { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .line-items th { background: #f5f5f5; text-align: left; padding: 10px; border-bottom: 2px solid #ddd; }
            .line-items td { padding: 12px 10px; border-bottom: 1px solid #eee; }
            .total-row { font-size: 1.1em; font-weight: bold; }
            .status-badge { display: inline-block; padding: 5px 10px; border-radius: 4px; font-size: 0.9em; font-weight: bold; }
            .status-paid { background: #e8f5e9; color: #2e7d32; }
            .status-pending { background: #fff3e0; color: #ef6c00; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
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

  const paginatedBills = bills.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // Construct UPI payment URL dynamically for the QR code
  const upiId = pg?.upi_id || "payment@smartpg";
  const getQrUrl = (amount) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
      `upi://pay?pa=${upiId}&pn=SmartPG&am=${amount}&cu=INR`
    )}`;
  };

  return (
    <Box p={{ xs: 2, sm: 3, md: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={4} sx={{ fontSize: { xs: "1.75rem", sm: "2.125rem" } }}>
        My Bills & Invoices
      </Typography>

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Bill ID</b></TableCell>
                <TableCell><b>Billing Period</b></TableCell>
                <TableCell align="right"><b>Original Amt</b></TableCell>
                <TableCell align="right"><b>Deductions</b></TableCell>
                <TableCell align="right"><b>Final Amt</b></TableCell>
                <TableCell align="right"><b>Paid</b></TableCell>
                <TableCell align="right"><b>Balance</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell align="center"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    No bills generated.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBills.map((bill) => (
                  <TableRow key={bill.bill_id} hover>
                    <TableCell>{bill.bill_id}</TableCell>
                    <TableCell>
                      {new Date(bill.billing_period_start).toLocaleDateString()} to{" "}
                      {new Date(bill.billing_period_end).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">₹{bill.original_amount}</TableCell>
                    <TableCell align="right" style={{ color: "#d32f2f" }}>
                      -₹{bill.absence_deduction}
                    </TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold" }}>
                      ₹{bill.final_amount}
                    </TableCell>
                    <TableCell align="right" style={{ color: "#2e7d32" }}>
                      ₹{bill.paid_amount}
                    </TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold" }}>
                      ₹{bill.balance_amount}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={bill.status.toUpperCase()}
                        size="small"
                        color={
                          bill.status === "paid"
                            ? "success"
                            : bill.status === "partial"
                            ? "warning"
                            : "error"
                        }
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PrintIcon />}
                          onClick={() => handlePrint(bill)}
                        >
                          Invoice
                        </Button>
                        {bill.balance_amount > 0 && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<PaymentsIcon />}
                            onClick={() => handleOpenPay(bill)}
                          >
                            Pay Now
                          </Button>
                        )}
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
          count={bills.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Printable Invoice Dialog */}
      {selectedInvoice && (
        <Dialog
          open={openInvoiceDialog}
          onClose={() => setOpenInvoiceDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle fontWeight="bold">Invoice Details</DialogTitle>
          <DialogContent>
            <div id="invoice-print-area">
              <table class="header-table" style={{ width: "100%", marginBottom: 20 }}>
                <tr>
                  <td>
                    <h2 style={{ margin: 0 }}>SMART MESS SYSTEM</h2>
                    <p style={{ margin: "5px 0" }}>Mess Fee Invoice</p>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <h3 style={{ margin: 0 }}>INVOICE #{selectedInvoice.bill_id}</h3>
                    <p style={{ margin: "5px 0" }}>
                      Date: {new Date(selectedInvoice.generated_at).toLocaleDateString()}
                    </p>
                  </td>
                </tr>
              </table>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Billed To:
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {selectedInvoice.member_name}
                  </Typography>
                  <Typography variant="body2">Member ID: {selectedInvoice.member_id}</Typography>
                </Grid>
                <Grid item xs={6} align="right">
                  <Typography variant="body2" color="text.secondary">
                    Billing Period:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {new Date(selectedInvoice.billing_period_start).toLocaleDateString()} to{" "}
                    {new Date(selectedInvoice.billing_period_end).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>

              <table class="line-items" style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    <th style={{ textAlign: "left", padding: 10 }}>Description</th>
                    <th style={{ textAlign: "right", padding: 10 }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>Base monthly fee for selected plan</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #eee", textAlign: "right" }}>
                      ₹{selectedInvoice.original_amount.toFixed(2)}
                    </td>
                  </tr>
                  {selectedInvoice.absence_deduction > 0 && (
                    <tr style={{ color: "#d32f2f" }}>
                      <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>Leave Absences Deduction</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #eee", textAlign: "right" }}>
                        -₹{selectedInvoice.absence_deduction.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  <tr class="total-row" style={{ fontWeight: "bold" }}>
                    <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>Total Invoice Amount</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #eee", textAlign: "right" }}>
                      ₹{selectedInvoice.final_amount.toFixed(2)}
                    </td>
                  </tr>
                  <tr style={{ color: "#2e7d32" }}>
                    <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>Total Paid</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #eee", textAlign: "right" }}>
                      ₹{selectedInvoice.paid_amount.toFixed(2)}
                    </td>
                  </tr>
                  <tr style={{ fontWeight: "bold", borderTop: "1.5px solid #333" }}>
                    <td style={{ padding: 10 }}>Outstanding Balance Due</td>
                    <td style={{ padding: 10, textAlign: "right" }}>
                      ₹{selectedInvoice.balance_amount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenInvoiceDialog(false)} color="inherit">
              Close
            </Button>
            <Button variant="contained" startIcon={<PrintIcon />} onClick={executePrint}>
              Print / Save PDF
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Pay Now UPI Dialog */}
      {payBill && (
        <Dialog open={openPayDialog} onClose={() => setOpenPayDialog(false)} fullWidth maxWidth="xs">
          <form onSubmit={handlePaySubmit}>
            <DialogTitle fontWeight="bold" align="center">
              Scan & Pay UPI
            </DialogTitle>
            <DialogContent sx={{ textAlign: "center" }}>
              <Box my={2}>
                <Typography variant="body2" color="text.secondary">
                  Scan QR code below using any UPI App (GPay, PhonePe, Paytm):
                </Typography>
              </Box>
              <Box my={3} display="flex" justifyContent="center">
                <img
                  src={getQrUrl(payBill.balance_amount)}
                  alt="UPI QR Code"
                  style={{ border: "1px solid #eee", padding: 10, borderRadius: 8 }}
                />
              </Box>
              <Box mb={3}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Amount Due: ₹{payBill.balance_amount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Merchant UPI ID: <b>{upiId}</b>
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Transaction Reference ID (e.g. UPI Ref No / UTR)"
                    value={formData.transaction_reference}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, transaction_reference: e.target.value }))
                    }
                    required
                    disabled={submitting}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Remarks (optional)"
                    value={formData.remarks}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, remarks: e.target.value }))
                    }
                    disabled={submitting}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenPayDialog(false)} color="inherit" disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="success" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Transaction Code"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </Box>
  );
}

export default MemberBills;
