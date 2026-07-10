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
import ApartmentIcon from "@mui/icons-material/Apartment";
import toast from "react-hot-toast";
import { getPGDetails, createPGDetails, updatePGDetails } from "../../api/pgApi";

function PG() {
  const [pg, setPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const [formData, setFormData] = useState({
    pg_name: "",
    address: "",
    upi_id: "",
    absence_threshold: 7,
  });

  const loadPGDetails = async () => {
    setLoading(true);
    try {
      const response = await getPGDetails();
      const pgData = response.data.data;
      setPg(pgData);
      setFormData({
        pg_name: pgData.pg_name || "",
        address: pgData.address || "",
        upi_id: pgData.upi_id || "",
        absence_threshold: pgData.absence_threshold ?? 7,
      });
      setIsNew(false);
    } catch (error) {
      if (error.response?.status === 404) {
        setIsNew(true);
        setEditMode(true);
      } else {
        console.error(error);
        toast.error("Failed to load PG details");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPGDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "absence_threshold" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pg_name.trim()) {
      toast.error("PG/Mess Name is required");
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await createPGDetails(formData);
        toast.success("PG settings initialized successfully");
      } else {
        await updatePGDetails(formData);
        toast.success("PG settings updated successfully");
      }
      setEditMode(false);
      loadPGDetails();
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
    <Box p={{ xs: 2, sm: 3, md: 4 }} sx={{ maxWidth: 800, mx: "auto" }}>
      <Paper elevation={4} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <ApartmentIcon color="primary" sx={{ fontSize: { xs: 32, sm: 40 }, mr: 2 }} />
          <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
            Mess / PG Profile Settings
          </Typography>
        </Box>
        <Divider sx={{ mb: 4 }} />

        {isNew && (
          <Typography color="warning.main" variant="body1" mb={3} sx={{ fontStyle: "italic" }}>
            * You have not configured your PG details yet. Please fill the settings below to start.
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mess / PG Name"
                name="pg_name"
                value={formData.pg_name}
                onChange={handleChange}
                disabled={!editMode || saving}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!editMode || saving}
                multiline
                rows={3}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="UPI ID for Payments (e.g. pgname@upi)"
                name="upi_id"
                value={formData.upi_id}
                onChange={handleChange}
                disabled={!editMode || saving}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Absence Threshold (Days)"
                name="absence_threshold"
                type="number"
                value={formData.absence_threshold}
                onChange={handleChange}
                disabled={!editMode || saving}
                helperText="Minimum leave days in a billing cycle to qualify for discount"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="flex-end" gap={2} mt={2}>
                {!editMode ? (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                    sx={{ width: { xs: "100%", sm: "auto" } }}
                  >
                    Edit Settings
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
                            pg_name: pg.pg_name || "",
                            address: pg.address || "",
                            upi_id: pg.upi_id || "",
                            absence_threshold: pg.absence_threshold ?? 7,
                          });
                        }}
                        disabled={saving}
                        sx={{ width: { xs: "100%", sm: "auto" } }}
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
                      sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                      {saving ? "Saving..." : "Save Settings"}
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

export default PG;