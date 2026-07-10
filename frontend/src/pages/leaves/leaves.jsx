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
  Tooltip,
  IconButton,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RefreshIcon from "@mui/icons-material/Refresh";
import toast from "react-hot-toast";
import { getAbsences, approveLeave, rejectLeave } from "../../api/absenceApi";

function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const response = await getAbsences();
      setLeaves(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleApprove = async (id) => {
    if (window.confirm("Approve this leave request? This will deduct the days from their next bill.")) {
      setActioning(true);
      try {
        await approveLeave(id);
        toast.success("Leave request approved successfully");
        loadLeaves();
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Approval failed");
      } finally {
        setActioning(false);
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Reject this leave request?")) {
      setActioning(true);
      try {
        await rejectLeave(id);
        toast.success("Leave request rejected");
        loadLeaves();
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Rejection failed");
      } finally {
        setActioning(false);
      }
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    const matchesSearch =
      leave.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.reason?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || leave.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedLeaves = filteredLeaves.slice(
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
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={4}
      >
        <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.75rem", sm: "2.125rem" } }}>
          Leave Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadLeaves}
          disabled={actioning}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          Refresh
        </Button>
      </Box>

      {/* Filter panel */}
      <Paper elevation={2} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Member Name or Reason..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
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
              <MenuItem value="all">All Leaves</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Table grid */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Member Name</b></TableCell>
                <TableCell><b>From Date</b></TableCell>
                <TableCell><b>To Date</b></TableCell>
                <TableCell><b>Total Days</b></TableCell>
                <TableCell><b>Reason</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell align="center"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLeaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    No Leave Requests Found.
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
                      <TableCell><b>{leave.member_name}</b></TableCell>
                      <TableCell>{new Date(leave.from_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(leave.to_date).toLocaleDateString()}</TableCell>
                      <TableCell>{days} days</TableCell>
                      <TableCell>{leave.reason || "N/A"}</TableCell>
                      <TableCell>
                        <Chip
                          label={leave.status.toUpperCase()}
                          size="small"
                          color={
                            leave.status === "approved"
                              ? "success"
                              : leave.status === "rejected"
                              ? "error"
                              : "warning"
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        {leave.status === "pending" ? (
                          <Box display="flex" justifyContent="center" gap={1}>
                            <Tooltip title="Approve">
                              <IconButton
                                color="success"
                                onClick={() => handleApprove(leave.absence_id)}
                                disabled={actioning}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                color="error"
                                onClick={() => handleReject(leave.absence_id)}
                                disabled={actioning}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Processed
                          </Typography>
                        )}
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
          count={filteredLeaves.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
    </Box>
  );
}

export default Leaves;
