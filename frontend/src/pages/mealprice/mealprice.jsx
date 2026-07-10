import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import LocalPizzaIcon from "@mui/icons-material/LocalPizza";
import toast from "react-hot-toast";
import { getMealPrice, createMealPrice, updateMealPrice } from "../../api/mealPriceApi";

function MealPrice() {
  const [mealPrice, setMealPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const [formData, setFormData] = useState({
    breakfast_price: 0,
    lunch_price: 0,
    dinner_price: 0,
    effective_from: new Date().toISOString().split("T")[0],
  });

  const loadMealPrice = async () => {
    setLoading(true);
    try {
      const response = await getMealPrice();
      const priceData = response.data.data;
      setMealPrice(priceData);
      setFormData({
        breakfast_price: priceData.breakfast_price ?? 0,
        lunch_price: priceData.lunch_price ?? 0,
        dinner_price: priceData.dinner_price ?? 0,
        effective_from: priceData.effective_from || new Date().toISOString().split("T")[0],
      });
      setIsNew(false);
    } catch (error) {
      if (error.response?.status === 404) {
        setIsNew(true);
        setEditMode(true);
      } else {
        console.error(error);
        toast.error("Failed to load meal price settings");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMealPrice();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "effective_from" ? value : parseFloat(value) || 0,
    }));
  };

  const validateForm = () => {
    if (formData.breakfast_price < 0 || formData.lunch_price < 0 || formData.dinner_price < 0) {
      toast.error("Prices cannot be negative values");
      return false;
    }
    if (!formData.effective_from) {
      toast.error("Effective date is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (isNew) {
        await createMealPrice(formData);
        toast.success("Meal prices set successfully");
      } else {
        await updateMealPrice(formData);
        toast.success("Meal prices updated successfully");
      }
      setEditMode(false);
      loadMealPrice();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4} sx={{ maxWidth: 850, mx: "auto" }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <LocalPizzaIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" fontWeight="bold">
            Meal Pricing Settings
          </Typography>
        </Box>
        <Divider sx={{ mb: 4 }} />

        {isNew && (
          <Typography color="warning.main" variant="body1" mb={3} sx={{ fontStyle: "italic" }}>
            * No active meal prices configured. Please establish the base rates.
          </Typography>
        )}

        {/* Pricing Cards View */}
        {!editMode && mealPrice && (
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: "#e3f2fd", borderRadius: 2, textAlign: "center" }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Breakfast Base Rate
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    ₹{mealPrice.breakfast_price}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: "#e8f5e9", borderRadius: 2, textAlign: "center" }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Lunch Base Rate
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    ₹{mealPrice.lunch_price}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: "#fff3e0", borderRadius: 2, textAlign: "center" }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Dinner Base Rate
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    ₹{mealPrice.dinner_price}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" align="right">
                Effective From: <b>{new Date(mealPrice.effective_from).toLocaleDateString()}</b>
              </Typography>
            </Grid>
          </Grid>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Breakfast Price (₹)"
                name="breakfast_price"
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                value={formData.breakfast_price}
                onChange={handleChange}
                disabled={!editMode || saving}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Lunch Price (₹)"
                name="lunch_price"
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                value={formData.lunch_price}
                onChange={handleChange}
                disabled={!editMode || saving}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Dinner Price (₹)"
                name="dinner_price"
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                value={formData.dinner_price}
                onChange={handleChange}
                disabled={!editMode || saving}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Effective From Date"
                name="effective_from"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.effective_from}
                onChange={handleChange}
                disabled={!editMode || saving}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                {!editMode ? (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                  >
                    Adjust Prices
                  </Button>
                ) : (
                  <>
                    {!isNew && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                          setEditMode(false);
                          setFormData({
                            breakfast_price: mealPrice.breakfast_price ?? 0,
                            lunch_price: mealPrice.lunch_price ?? 0,
                            dinner_price: mealPrice.dinner_price ?? 0,
                            effective_from: mealPrice.effective_from || new Date().toISOString().split("T")[0],
                          });
                        }}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      variant="contained"
                      color="success"
                      startIcon={<SaveIcon />}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Prices"}
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

export default MealPrice;