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
import toast from "react-hot-toast";

import { getComplaints, updateComplaintStatus } from "../../api/complaintApi";

function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Status Change Dialog
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState("open");

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const response = await getComplaints();
      setComplaints(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load complaints records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleOpenStatusChange = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setOpenStatusDialog(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setSaving(true);
    try {
      await updateComplaintStatus(selectedComplaint.complaint_id, {
        status: newStatus,
      });
      toast.success("Complaint status updated successfully");
      setOpenStatusDialog(false);
      loadComplaints();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const paginatedComplaints = filteredComplaints.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "error";
      case "in_progress":
        return "warning";
      case "resolved":
        return "success";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={{ xs: 2, sm: 3, md: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={4} sx={{ fontSize: { xs: "1.75rem", sm: "2.125rem" } }}>
        Complaints & Grievances
      </Typography>

      {/* Filter Strip */}
      <Paper elevation={2} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search Member Name or Description..."
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
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              size="small"
              label="Category"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="Food">Food</MenuItem>
              <MenuItem value="Electricity">Electricity</MenuItem>
              <MenuItem value="Water">Water</MenuItem>
              <MenuItem value="WiFi">WiFi</MenuItem>
              <MenuItem value="Cleaning">Cleaning</MenuItem>
              <MenuItem value="Room">Room</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Complaints Grid table */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Member Name</b></TableCell>
                <TableCell><b>Category</b></TableCell>
                <TableCell><b>Description</b></TableCell>
                <TableCell><b>Date Created</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell align="center"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedComplaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    No Complaints Logged.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedComplaints.map((c) => (
                  <TableRow key={c.complaint_id} hover>
                    <TableCell>{c.complaint_id}</TableCell>
                    <TableCell><b>{c.member_name}</b></TableCell>
                    <TableCell>
                      <Chip label={c.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.description}
                    </TableCell>
                    <TableCell>{new Date(c.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={c.status.replace("_", " ").toUpperCase()}
                        size="small"
                        color={getStatusColor(c.status)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenStatusChange(c)}
                      >
                        Update Status
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
          count={filteredComplaints.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Change status dialog */}
      {selectedComplaint && (
        <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)} fullWidth maxWidth="xs">
          <form onSubmit={handleStatusSubmit}>
            <DialogTitle fontWeight="bold">Update Complaint Status</DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <Box mb={2}>
                <Typography variant="caption" color="text.secondary">
                  Member:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedComplaint.member_name}
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="caption" color="text.secondary">
                  Complaint Description:
                </Typography>
                <Typography variant="body2" sx={{ bgcolor: "#f5f5f5", p: 1.5, borderRadius: 1 }}>
                  {selectedComplaint.description}
                </Typography>
              </Box>
              <TextField
                fullWidth
                select
                label="Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                sx={{ mt: 1 }}
              >
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </TextField>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenStatusDialog(false)} color="inherit" disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" disabled={saving}>
                {saving ? "Saving..." : "Update Status"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </Box>
  );
}

export default Complaints;