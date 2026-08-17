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
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NotesIcon from "@mui/icons-material/Notes";
import toast from "react-hot-toast";

import { getAbsences, applyLeave } from "../../api/absenceApi";

function MemberLeaves() {
  const isMobile = useMediaQuery("(max-width:767.95px)");
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Pagination for Desktop
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Leave Form state
  const [formData, setFormData] = useState({
    from_date: "",
    to_date: "",
    reason: "",
  });

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const response = await getAbsences();
      setLeaves(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load leave history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.from_date) {
      toast.error("From date is required");
      return false;
    }
    if (!formData.to_date) {
      toast.error("To date is required");
      return false;
    }
    const from = new Date(formData.from_date);
    const to = new Date(formData.to_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (from < today) {
      toast.error("Start date cannot be in the past");
      return false;
    }
    if (to < from) {
      toast.error("End date cannot be before start date");
      return false;
    }
    if (!formData.reason.trim()) {
      toast.error("Reason for leave is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await applyLeave(formData);
      toast.success("Leave request submitted successfully");
      setFormData({
        from_date: "",
        to_date: "",
        reason: "",
      });
      loadLeaves();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const paginatedLeaves = leaves.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress color="secondary" size={50} thickness={4} />
      </Box>
    );
  }

  return (
    <Box p={{ xs: 2, sm: 3, md: 4 }} sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%", boxSizing: "border-box" }}>
      <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
        Leave Absence Requests
      </Typography>

      <Grid container spacing={3}>
        {/* Form Section */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: "8px",
              border: "1px solid",
              borderColor: "divider",
              background: "white",
              boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={2} sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
              File New Leave Request
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2.5} alignItems="flex-start">
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="From Date"
                    name="from_date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.from_date}
                    onChange={handleFormChange}
                    required
                    disabled={submitting}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="To Date"
                    name="to_date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.to_date}
                    onChange={handleFormChange}
                    required
                    disabled={submitting}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Reason"
                    name="reason"
                    placeholder="Enter reason for leave"
                    InputLabelProps={{ shrink: true }}
                    value={formData.reason}
                    onChange={handleFormChange}
                    required
                    disabled={submitting}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                  />
                </Grid>
                <Grid item xs={12} sm={2} sx={{ mt: { xs: 0, sm: 0.5 } }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon />}
                    disabled={submitting}
                    sx={{ height: "48px", borderRadius: "6px", fontWeight: "bold", textTransform: "none" }}
                  >
                    {submitting ? "Applying..." : "Apply"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* History Section */}
        <Grid item xs={12}>
          {isMobile ? (
            /* Mobile View: Timeline Cards (No Table, No Pagination) */
            <Box display="flex" flexDirection="column" gap={2.5} sx={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: "1.1rem" }}>
                My Leave Request History
              </Typography>
              {leaves.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    p: { xs: 2.5, sm: 3.5 },
                    textAlign: "center",
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: "divider",
                    background: "white",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                  }}
                >
                  <Typography color="text.secondary">No Leave Requests Lodged.</Typography>
                </Paper>
              ) : (
                leaves.map((leave) => {
                  const days =
                    Math.ceil(
                      (new Date(leave.to_date) - new Date(leave.from_date)) /
                        (1000 * 60 * 60 * 24)
                    ) + 1;

                  return (
                    <Paper
                      key={leave.absence_id}
                      elevation={0}
                      sx={{
                        width: "100%",
                        maxWidth: "100%",
                        boxSizing: "border-box",
                        p: { xs: 2.5, sm: 3.5 },
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: "divider",
                        background: "white",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                      }}
                    >
                      {/* Header: Title, ID & Status Badge */}
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5} flexWrap="nowrap">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" fontWeight="700" color="text.primary" sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}>
                            Leave Request
                          </Typography>
                          <Typography variant="caption" fontWeight="600" color="text.secondary">
                            #{leave.absence_id}
                          </Typography>
                        </Box>
                        <Chip
                          label={leave.status.toUpperCase()}
                          size="small"
                          sx={{
                            fontWeight: "bold",
                            fontSize: "10px",
                            height: "22px",
                            borderRadius: "4px",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            bgcolor:
                              leave.status === "approved"
                                ? "#ecfdf5"
                                : leave.status === "rejected"
                                ? "#fef2f2"
                                : "#fffbeb",
                            color:
                              leave.status === "approved"
                                ? "#10b981"
                                : leave.status === "rejected"
                                ? "#ef4444"
                                : "#f59e0b",
                          }}
                        />
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      {/* Details with Icons */}
                      <Box display="flex" flexDirection="column" gap={2} sx={{ width: "100%", boxSizing: "border-box" }}>
                        <Grid container spacing={1.5} sx={{ width: "100%", margin: 0 }}>
                          <Grid item xs={6} sx={{ pl: "0 !important", pt: "0 !important" }}>
                            <Box display="flex" alignItems="center" gap={0.75} mb={0.5}>
                              <EventIcon sx={{ fontSize: 16, color: "#64748b" }} />
                              <Typography variant="caption" fontWeight="600" color="text.secondary">
                                From
                              </Typography>
                            </Box>
                            <Typography variant="body2" fontWeight="700" color="text.primary" sx={{ pl: 3 }}>
                              {new Date(leave.from_date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                            </Typography>
                          </Grid>

                          <Grid item xs={6} sx={{ pt: "0 !important" }}>
                            <Box display="flex" alignItems="center" gap={0.75} mb={0.5}>
                              <EventIcon sx={{ fontSize: 16, color: "#64748b" }} />
                              <Typography variant="caption" fontWeight="600" color="text.secondary">
                                To
                              </Typography>
                            </Box>
                            <Typography variant="body2" fontWeight="700" color="text.primary" sx={{ pl: 3 }}>
                              {new Date(leave.to_date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                            </Typography>
                          </Grid>
                        </Grid>

                        <Box sx={{ width: "100%" }}>
                          <Box display="flex" alignItems="center" gap={0.75} mb={0.5}>
                            <AccessTimeIcon sx={{ fontSize: 16, color: "#64748b" }} />
                            <Typography variant="caption" fontWeight="600" color="text.secondary">
                              Duration
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight="700" color="primary.main" sx={{ pl: 3 }}>
                            {days} {days === 1 ? "Day" : "Days"}
                          </Typography>
                        </Box>

                        <Box sx={{ width: "100%" }}>
                          <Box display="flex" alignItems="center" gap={0.75} mb={0.5}>
                            <NotesIcon sx={{ fontSize: 16, color: "#64748b" }} />
                            <Typography variant="caption" fontWeight="600" color="text.secondary">
                              Reason
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.primary" sx={{ pl: 3, wordBreak: "break-word" }}>
                            {leave.reason || "General leave request"}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })
              )}
            </Box>
          ) : (
            /* Desktop View: Table + Pagination */
            <Paper elevation={0} sx={{ borderRadius: 1.25, border: "1px solid", borderColor: "divider", overflow: "hidden", background: "white" }}>
              <Typography variant="h6" fontWeight="bold" p={3}>
                My Leave Request History
              </Typography>
              <Divider />
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><b>ID</b></TableCell>
                      <TableCell><b>From Date</b></TableCell>
                      <TableCell><b>To Date</b></TableCell>
                      <TableCell><b>Total Days</b></TableCell>
                      <TableCell><b>Reason</b></TableCell>
                      <TableCell><b>Status</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedLeaves.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          No Leave Requests Lodged.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedLeaves.map((leave) => {
                        const days =
                          Math.ceil(
                            (new Date(leave.to_date) - new Date(leave.from_date)) /
                              (1000 * 60 * 60 * 24)
                          ) + 1;

                        return (
                          <TableRow key={leave.absence_id} hover>
                            <TableCell>{leave.absence_id}</TableCell>
                            <TableCell>{new Date(leave.from_date).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(leave.to_date).toLocaleDateString()}</TableCell>
                            <TableCell>{days} days</TableCell>
                            <TableCell>{leave.reason}</TableCell>
                            <TableCell>
                              <Chip
                                label={leave.status.toUpperCase()}
                                size="small"
                                sx={{
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                  bgcolor:
                                    leave.status === "approved"
                                      ? "#ecfdf5"
                                      : leave.status === "rejected"
                                      ? "#fef2f2"
                                      : "#fffbeb",
                                  color:
                                    leave.status === "approved"
                                      ? "#10b981"
                                      : leave.status === "rejected"
                                      ? "#ef4444"
                                      : "#f59e0b",
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={leaves.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default MemberLeaves;
