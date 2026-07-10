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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import toast from "react-hot-toast";

import { getComplaints, raiseComplaint } from "../../api/complaintApi";

function MemberComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Form State
  const [formData, setFormData] = useState({
    category: "Food",
    description: "",
  });

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const response = await getComplaints();
      setComplaints(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.category) {
      toast.error("Please select a category");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Please provide a description of the issue");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await raiseComplaint(formData);
      toast.success("Complaint submitted successfully");
      setFormData({
        category: "Food",
        description: "",
      });
      loadComplaints();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to submit complaint");
    } finally {
      setSubmitting(false);
    }
  };

  const paginatedComplaints = complaints.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
        My Complaints & Issues
      </Typography>

      <Grid container spacing={4}>
        {/* Form */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Raise New Issue
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  >
                    <MenuItem value="Food">Food / Mess</MenuItem>
                    <MenuItem value="WiFi">WiFi / Internet</MenuItem>
                    <MenuItem value="Electricity">Electricity</MenuItem>
                    <MenuItem value="Water">Water Supply</MenuItem>
                    <MenuItem value="Cleaning">Cleaning / Hygiene</MenuItem>
                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                    <MenuItem value="Room">Room Issue</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide details about the issue..."
                    required
                    disabled={submitting}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Raise Complaint"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Complaints History */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Typography variant="h6" fontWeight="bold" p={3} bgcolor="#fafafa">
              My Complaints History
            </Typography>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><b>ID</b></TableCell>
                    <TableCell><b>Category</b></TableCell>
                    <TableCell><b>Description</b></TableCell>
                    <TableCell><b>Date Filed</b></TableCell>
                    <TableCell><b>Status</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedComplaints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        No complaints logged yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedComplaints.map((c) => (
                      <TableRow key={c.complaint_id} hover>
                        <TableCell>{c.complaint_id}</TableCell>
                        <TableCell>
                          <Chip label={c.category} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {c.description}
                        </TableCell>
                        <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={c.status.replace("_", " ").toUpperCase()}
                            size="small"
                            color={getStatusColor(c.status)}
                          />
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
              count={complaints.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default MemberComplaints;
