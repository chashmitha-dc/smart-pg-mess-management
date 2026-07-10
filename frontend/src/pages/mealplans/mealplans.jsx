import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
  Paper,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import toast from "react-hot-toast";

import MealPlanTable from "./MealPlanTable";
import MealPlanDialog from "./MealPlanDialog";

import {
  getMealPlans,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
} from "../../api/mealPlanApi";

function MealPlans() {
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const initialForm = {
    plan_name: "",
    breakfast: false,
    lunch: false,
    dinner: false,
    active: true,
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    loadMealPlans();
  }, []);

  const loadMealPlans = async () => {
    setLoading(true);
    try {
      const response = await getMealPlans();
      setMealPlans(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load meal plans");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSwitchChange = (field, val) => {
    setFormData({
      ...formData,
      [field]: val,
    });
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    setSelectedPlanId(null);
    setFormData(initialForm);
    setOpen(true);
  };

  const handleEdit = (plan) => {
    setEditMode(true);
    setSelectedPlanId(plan.plan_id);
    setFormData({
      plan_name: plan.plan_name,
      breakfast: plan.breakfast,
      lunch: plan.lunch,
      dinner: plan.dinner,
      active: plan.active,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialForm);
  };

  const validateForm = () => {
    if (!formData.plan_name.trim()) {
      toast.error("Plan name is required");
      return false;
    }
    if (!formData.breakfast && !formData.lunch && !formData.dinner) {
      toast.error("Meal plan must include at least one meal (Breakfast, Lunch, or Dinner)");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editMode) {
        await updateMealPlan(selectedPlanId, formData);
        toast.success("Meal plan updated successfully");
      } else {
        await createMealPlan(formData);
        toast.success("Meal plan created successfully");
      }
      handleClose();
      loadMealPlans();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (planId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this meal plan? This might affect members subscribed to it."
    );
    if (!confirmDelete) return;

    try {
      await deleteMealPlan(planId);
      toast.success("Meal plan deleted successfully");
      loadMealPlans();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const filteredPlans = mealPlans.filter((plan) =>
    plan.plan_name.toLowerCase().includes(searchQuery.toLowerCase())
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
          Meal Plans
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ borderRadius: 2 }}
        >
          Add Meal Plan
        </Button>
      </Box>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Plan Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <MealPlanTable
          mealPlans={filteredPlans}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Paper>

      <MealPlanDialog
        open={open}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        formData={formData}
        handleChange={handleChange}
        handleSwitchChange={handleSwitchChange}
        loading={saving}
        editMode={editMode}
      />
    </Box>
  );
}

export default MealPlans;