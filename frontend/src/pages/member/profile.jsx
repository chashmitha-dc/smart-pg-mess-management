import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import SettingsIcon from "@mui/icons-material/Settings";
import toast from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";
import { updateMemberProfile } from "../../api/memberApi";

function MemberProfile() {
  const { user, loadUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    profile_image: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        password: "",
        profile_image: user.profile_image || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {};
      if (formData.password.trim()) {
        data.password = formData.password;
      }
      if (formData.profile_image.trim()) {
        data.profile_image = formData.profile_image;
      }

      await updateMemberProfile(data);
      toast.success("Profile updated successfully");
      
      // Reload profile details in Auth context
      if (loadUser) {
        await loadUser();
      }
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile details");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={{ xs: 2, sm: 3, md: 4 }} sx={{ maxWidth: 850, mx: "auto" }}>
      <Paper elevation={4} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <SettingsIcon color="primary" sx={{ fontSize: { xs: 32, sm: 40 }, mr: 2 }} />
          <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
            Member Profile Settings
          </Typography>
        </Box>
        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={4}>
          {/* Read-only details */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              PG Subscription Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Full Name
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {user.member_name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Registered Phone
                </Typography>
                <Typography variant="body1">{user.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Emergency Contact
                </Typography>
                <Typography variant="body1">{user.emergency_contact}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Active Meal Plan
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {user.plan_name || "No Active Plan"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Joining Date
                </Typography>
                <Typography variant="body1">
                  {user.joining_date ? new Date(user.joining_date).toLocaleDateString() : "N/A"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Next Billing Cycle Date
                </Typography>
                <Typography variant="body1" style={{ color: "#d32f2f", fontWeight: "bold" }}>
                  {user.next_billing_date ? new Date(user.next_billing_date).toLocaleDateString() : "N/A"}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Editable settings form */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Update Credentials
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Profile Photo URL (optional)"
                    name="profile_image"
                    value={formData.profile_image}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="New Password (leave blank to keep current)"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={saving}
                    fullWidth
                  >
                    {saving ? "Saving changes..." : "Save Profile"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default MemberProfile;
