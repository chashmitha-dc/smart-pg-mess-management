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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ReceiptIcon from "@mui/icons-material/Receipt";
import Autocomplete from "@mui/material/Autocomplete";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import toast from "react-hot-toast";

import { getBills, generateAllBills, generateMemberBill } from "../../api/billingApi";
import { getMembers } from "../../api/memberApi";

function Billing() {
  const [bills, setBills] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialogs
  const [openSingleBillDialog, setOpenSingleBillDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Invoice details view
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [billsRes, membersRes] = await Promise.all([getBills(), getMembers()]);
      setBills(billsRes.data.data || []);
      setMembers(membersRes.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load billing records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateAll = async () => {
    if (
      window.confirm(
        "Are you sure you want to generate bills for all active members for the current cycle?"
      )
    ) {
      setGenerating(true);
      try {
        const res = await generateAllBills();
        const data = res.data.data;
        toast.success(
          `Generated ${data.generated_count} bills successfully. (Skipped ${data.skipped_count} existing)`
        );
        loadData();
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Billing generation failed");
      } finally {
        setGenerating(false);
      }
    }
  };

  const handleGenerateSingle = async () => {
    if (!selectedMember) {
      toast.error("Please select a member");
      return;
    }

    setGenerating(true);
    try {
      await generateMemberBill(selectedMember.member_id);
      toast.success(`Bill generated successfully for ${selectedMember.member_name}`);
      setOpenSingleBillDialog(false);
      setSelectedMember(null);
      loadData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Bill generation failed");
    } finally {
      setGenerating(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (bills.length === 0) {
      toast.error("No bills to export");
      return;
    }

    const headers = [
      "Bill ID",
      "Member Name",
      "Cycle Start",
      "Cycle End",
      "Original Amount",
      "Absence Deduction",
      "Final Amount",
      "Paid",
      "Balance",
      "Status",
    ];

    const rows = bills.map((b) => [
      b.bill_id,
      b.member_name,
      b.billing_period_start,
      b.billing_period_end,
      b.original_amount,
      b.absence_deduction,
      b.final_amount,
      b.paid_amount,
      b.balance_amount,
      b.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mess_billing_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open invoice print layout
  const handlePrint = (bill) => {
    setSelectedInvoice(bill);
    setOpenInvoiceDialog(true);
  };

  const executePrint = () => {
    const printContent = document.getElementById("invoice-print-area").innerHTML;
    const originalContent = document.body.innerHTML;
    
    // Simple popup print window to avoid UI disruptions
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

  const filteredBills = bills.filter((b) => {
    const matchesSearch = b.member_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedBills = filteredBills.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={{ xs: 2, sm: 3, md: 4 }}>
      <Box
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        gap={2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        mb={4}
      >
        <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.75rem", sm: "2.125rem" } }}>
          Billing & Invoicing
        </Typography>

        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          gap={2}
          width={{ xs: "100%", md: "auto" }}
        >
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setOpenSingleBillDialog(true)}
            disabled={generating}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Generate Single Bill
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateAll}
            disabled={generating}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {generating ? "Generating..." : "Generate All Bills"}
          </Button>
        </Box>
      </Box>

      {/* Filter grid */}
      <Paper elevation={2} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Member Name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
              <MenuItem value="all">All Bills</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="partial">Partial</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Invoice list table */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Member Name</b></TableCell>
                <TableCell><b>Billing Cycle</b></TableCell>
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
                  <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                    No Bills Found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBills.map((bill) => (
                  <TableRow key={bill.bill_id} hover>
                    <TableCell>{bill.bill_id}</TableCell>
                    <TableCell><b>{bill.member_name}</b></TableCell>
                    <TableCell>
                      {new Date(bill.billing_period_start).toLocaleDateString()} -{" "}
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
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        onClick={() => handlePrint(bill)}
                      >
                        Print Invoice
                      </Button>
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
          count={filteredBills.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Generate Single Bill Dialog */}
      <Dialog
        open={openSingleBillDialog}
        onClose={() => setOpenSingleBillDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle fontWeight="bold">Generate Bill for Member</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Autocomplete
            options={members.filter((m) => m.status === "active")}
            getOptionLabel={(option) => `${option.member_name} (${option.phone})`}
            value={selectedMember}
            onChange={(event, newValue) => setSelectedMember(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Select Member" fullWidth variant="outlined" sx={{ mt: 1 }} />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenSingleBillDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateSingle}
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Printable Invoice Dialog */}
      {selectedInvoice && (
        <Dialog
          open={openInvoiceDialog}
          onClose={() => setOpenInvoiceDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle fontWeight="bold">Invoice Preview</DialogTitle>
          <DialogContent>
            <div id="invoice-print-area">
              <table class="header-table">
                <tr>
                  <td>
                    <h2 style={{ margin: 0 }}>SMART MESS SYSTEM</h2>
                    <p style={{ margin: "5px 0" }}>Mess Fee Invoice</p>
                  </td>
                  <td class="right-align">
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
                  <Box mt={1}>
                    <span
                      class={`status-badge status-${
                        selectedInvoice.status === "paid" ? "paid" : "pending"
                      }`}
                    >
                      {selectedInvoice.status.toUpperCase()}
                    </span>
                  </Box>
                </Grid>
              </Grid>

              <table class="line-items">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th class="right-align">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Base Monthly Mess Fee (Calculated Daily Rates)</td>
                    <td class="right-align">₹{selectedInvoice.original_amount.toFixed(2)}</td>
                  </tr>
                  {selectedInvoice.absence_deduction > 0 && (
                    <tr style={{ color: "#d32f2f" }}>
                      <td>Approved Absences Deduction</td>
                      <td class="right-align">-₹{selectedInvoice.absence_deduction.toFixed(2)}</td>
                    </tr>
                  )}
                  {selectedInvoice.manual_discount > 0 && (
                    <tr style={{ color: "#d32f2f" }}>
                      <td>Special Discount applied</td>
                      <td class="right-align">-₹{selectedInvoice.manual_discount.toFixed(2)}</td>
                    </tr>
                  )}
                  {selectedInvoice.late_fee > 0 && (
                    <tr>
                      <td>Late Fee / Overdue Penalty</td>
                      <td class="right-align">₹{selectedInvoice.late_fee.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr class="total-row">
                    <td>Final Total Amount Due</td>
                    <td class="right-align">₹{selectedInvoice.final_amount.toFixed(2)}</td>
                  </tr>
                  <tr style={{ color: "#2e7d32", fontSize: "0.95em" }}>
                    <td>Paid Amount</td>
                    <td class="right-align">₹{selectedInvoice.paid_amount.toFixed(2)}</td>
                  </tr>
                  <tr class="total-row" style={{ borderTop: "1.5px double #333", fontSize: "1.1em" }}>
                    <td>Balance Outstanding</td>
                    <td class="right-align">₹{selectedInvoice.balance_amount.toFixed(2)}</td>
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
    </Box>
  );
}

export default Billing;