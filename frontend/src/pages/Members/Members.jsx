import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Paper,
  TablePagination,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import toast from "react-hot-toast";

import MemberTable from "./MemberTable";
import MemberDialog from "./MemberDialog";

import {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
} from "../../api/memberApi";

import { getMealPlans } from "../../api/mealPlanApi";

function Members() {
  const [members, setMembers] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  // Sorting state
  const [sortField, setSortField] = useState("member_id");
  const [sortOrder, setSortOrder] = useState("asc");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Delete dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberIdToDelete, setMemberIdToDelete] = useState(null);

  const initialForm = {
    member_name: "",
    phone: "",
    emergency_contact: "",
    current_plan_id: "",
    status: "active",
    joining_date: new Date().toISOString().split("T")[0],
    password: "",
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [memberRes, mealPlanRes] = await Promise.all([
        getMembers(),
        getMealPlans(),
      ]);

      setMembers(memberRes.data.data || []);
      setMealPlans(mealPlanRes.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    setSelectedMemberId(null);
    setFormData(initialForm);
    setOpen(true);
  };

  const handleEdit = (member) => {
    setEditMode(true);
    setSelectedMemberId(member.member_id);

    setFormData({
      member_name: member.member_name,
      phone: member.phone,
      emergency_contact: member.emergency_contact || "",
      current_plan_id: member.current_plan_id,
      status: member.status,
      joining_date: member.joining_date
        ? member.joining_date.split("T")[0]
        : new Date().toISOString().split("T")[0],
    });

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialForm);
  };

  const validateForm = () => {
    if (!formData.member_name.trim()) {
      toast.error("Member Name is required");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    if (formData.phone.length !== 10 || !/^\d+$/.test(formData.phone)) {
      toast.error("Phone number must be exactly 10 digits");
      return false;
    }
    if (!formData.current_plan_id) {
      toast.error("Meal Plan selection is required");
      return false;
    }
    if (!formData.status) {
      toast.error("Status is required");
      return false;
    }
    if (!formData.joining_date) {
      toast.error("Joining Date is required");
      return false;
    }
    const todayStr = new Date().toISOString().split("T")[0];
    if (formData.joining_date > todayStr) {
      toast.error("Joining Date cannot be in the future");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        ...formData,
        emergency_contact: formData.emergency_contact.trim() || null,
      };

      if (editMode) {
        await updateMember(selectedMemberId, payload);
        toast.success("Member updated successfully");
      } else {
        await createMember(payload);
        toast.success("Member created successfully");
      }

      handleClose();
      loadInitialData();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Operation failed"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (memberId) => {
    setMemberIdToDelete(memberId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMember(memberIdToDelete);
      toast.success("Member deleted successfully");
      loadInitialData();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Delete failed"
      );
    } finally {
      setDeleteConfirmOpen(false);
      setMemberIdToDelete(null);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Reset page when search or filters change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  const handlePlanFilterChange = (e) => {
    setPlanFilter(e.target.value);
    setPage(0);
  };

  // Filter members client-side
  const filteredMembers = members.filter((member) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      member.member_name.toLowerCase().includes(searchLower) ||
      member.phone.includes(searchQuery);

    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;

    const matchesPlan =
      planFilter === "all" || member.current_plan_id === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Sort members client-side
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (valA === undefined || valA === null) valA = "";
    if (valB === undefined || valB === null) valB = "";

    if (typeof valA === "string") {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedMembers = sortedMembers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" fontWeight="bold">
          Members Management
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ borderRadius: 2 }}
        >
          Add Member
        </Button>
      </Box>

      {/* Filters section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Name or Phone..."
              value={searchQuery}
              onChange={handleSearchChange}
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
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              size="small"
              label="Meal Plan"
              value={planFilter}
              onChange={handlePlanFilterChange}
            >
              <MenuItem value="all">All Plans</MenuItem>
              {mealPlans.map((plan) => (
                <MenuItem key={plan.plan_id} value={plan.plan_id}>
                  {plan.plan_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Table section */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <MemberTable
          members={paginatedMembers}
          mealPlans={mealPlans}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredMembers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      <MemberDialog
        open={open}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        formData={formData}
        handleChange={handleChange}
        mealPlans={mealPlans}
        loading={saving}
        editMode={editMode}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this member? All associated leave records, bills, and notifications will be deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Members;