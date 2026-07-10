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
import AddIcon from "@mui/icons-material/Add";
import Autocomplete from "@mui/material/Autocomplete";
import toast from "react-hot-toast";

import { getNotifications, sendNotification, deleteNotification } from "../../api/notificationApi";
import { getMembers } from "../../api/memberApi";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Send Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [recipientType, setRecipientType] = useState("all"); // "all" or "specific"
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "general",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [notifRes, membersRes] = await Promise.all([getNotifications(), getMembers()]);
      setNotifications(notifRes.data.data || []);
      setMembers(membersRes.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (recipientType === "specific" && !selectedMember) {
      toast.error("Please select a specific member");
      return false;
    }
    if (!formData.title.trim()) {
      toast.error("Notification title is required");
      return false;
    }
    if (!formData.message.trim()) {
      toast.error("Notification message is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      await sendNotification({
        member_id: recipientType === "all" ? "all" : selectedMember.member_id,
        title: formData.title,
        message: formData.message,
        type: formData.type,
      });

      toast.success(
        recipientType === "all"
          ? "Notification broadcasted to all members"
          : "Notification sent to member successfully"
      );
      setOpenDialog(false);
      setSelectedMember(null);
      setFormData({
        title: "",
        message: "",
        type: "general",
      });
      loadData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notification record?")) {
      try {
        await deleteNotification(id);
        toast.success("Notification record deleted");
        loadData();
      } catch (error) {
        console.error(error);
        toast.error("Delete failed");
      }
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      n.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || n.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const paginatedNotifications = filteredNotifications.slice(
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
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Notifications Composer
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ borderRadius: 2 }}
        >
          Send Notification
        </Button>
      </Box>

      {/* Filter strip */}
      <Paper elevation={2} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search Title, Message or Recipient..."
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
              label="Type"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="bill">Bill</MenuItem>
              <MenuItem value="payment">Payment</MenuItem>
              <MenuItem value="leave">Leave</MenuItem>
              <MenuItem value="complaint">Complaint</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Notifications grid table */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Recipient</b></TableCell>
                <TableCell><b>Type</b></TableCell>
                <TableCell><b>Title</b></TableCell>
                <TableCell><b>Message</b></TableCell>
                <TableCell><b>Date Sent</b></TableCell>
                <TableCell align="center"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedNotifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    No Notifications Found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedNotifications.map((n) => (
                  <TableRow key={n.notification_id} hover>
                    <TableCell>{n.notification_id}</TableCell>
                    <TableCell><b>{n.member_name}</b></TableCell>
                    <TableCell>
                      <Chip label={n.type.toUpperCase()} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell style={{ fontWeight: "bold" }}>{n.title}</TableCell>
                    <TableCell sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {n.message}
                    </TableCell>
                    <TableCell>{new Date(n.created_at).toLocaleString()}</TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDelete(n.notification_id)}
                      >
                        Delete
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
          count={filteredNotifications.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Send Notification Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <DialogTitle fontWeight="bold">Send Notification Alert</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Send To"
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                  required
                >
                  <MenuItem value="all">All Active Members</MenuItem>
                  <MenuItem value="specific">Specific Member</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Notification Type"
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  required
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="bill">Bill Alert</MenuItem>
                  <MenuItem value="payment">Payment Alert</MenuItem>
                  <MenuItem value="leave">Leave Update</MenuItem>
                  <MenuItem value="complaint">Complaint Update</MenuItem>
                </TextField>
              </Grid>
              {recipientType === "specific" && (
                <Grid item xs={12}>
                  <Autocomplete
                    options={members.filter((m) => m.status === "active")}
                    getOptionLabel={(option) => `${option.member_name} (${option.phone})`}
                    value={selectedMember}
                    onChange={(event, newValue) => setSelectedMember(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Recipient Member" required fullWidth />
                    )}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject / Title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message Content"
                  name="message"
                  multiline
                  rows={4}
                  value={formData.message}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)} color="inherit" disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={saving}>
              {saving ? "Sending..." : "Send Announcement"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Notifications;