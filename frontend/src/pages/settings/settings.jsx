import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SettingsIcon from "@mui/icons-material/Settings";
import toast from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";
import { updateOwnerProfile } from "../../api/authApi";
import { getBackupFile, uploadRestoreFile } from "../../api/backupApi";

function Settings() {
  const { user, loadUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile fields
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // Backup restore file state
  const [restoreFile, setRestoreFile] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
      });
    }
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!profileData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
      };
      if (profileData.password.trim()) {
        payload.password = profileData.password;
      }

      await updateOwnerProfile(payload);
      toast.success("Profile details updated successfully");
      
      // Reload profile context details so changes are visible instantly
      if (loadUser) {
        await loadUser();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Database Backup Download
  const handleDownloadBackup = async () => {
    setLoading(true);
    try {
      const response = await getBackupFile();
      
      // Process blob download
      const blob = new Blob([response.data], { type: "application/json" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `smart_pg_backup_${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success("Database backup download started");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate database backup");
    } finally {
      setLoading(false);
    }
  };

  // Database Restore Upload
  const handleFileChange = (e) => {
    setRestoreFile(e.target.files[0] || null);
  };

  const handleRestoreSubmit = async (e) => {
    e.preventDefault();
    if (!restoreFile) {
      toast.error("Please select a JSON backup file to upload");
      return;
    }

    const confirmRestore = window.confirm(
      "WARNING: Restoring the database will permanently delete all existing active records. Proceed?"
    );

    if (!confirmRestore) return;

    setSaving(true);
    const toastId = toast.loading("Restoring database from file dump...");
    try {
      await uploadRestoreFile(restoreFile);
      toast.success("Database restored successfully!", { id: toastId });
      setRestoreFile(null);
      
      // Empty input
      const fileInput = document.getElementById("backup-file-input");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Restore failed", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box p={{ xs: 2, sm: 3, md: 4 }} sx={{ maxWidth: 850, mx: "auto" }}>
      <Paper elevation={4} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <SettingsIcon color="primary" sx={{ fontSize: { xs: 32, sm: 40 }, mr: 2 }} />
          <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
            System Settings
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="Owner Profile" />
            <Tab label="Database Backup & Restore" />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <form onSubmit={handleProfileSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Owner Name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  required
                  disabled={saving}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  required
                  disabled={saving}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  disabled={saving}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="New Password (leave blank to keep current)"
                  name="password"
                  type="password"
                  value={profileData.password}
                  onChange={handleProfileChange}
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={saving}
                    sx={{ width: { xs: "100%", sm: "auto" } }}
                  >
                    {saving ? "Saving Changes..." : "Save Details"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        )}

        {tabValue === 1 && (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 3, textAlign: "center", borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" mb={1}>
                  Database Export (Backup)
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Generate and download a complete copy of all PG configurations, member records, bills, payments, and histories in JSON format.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadBackup}
                  disabled={loading}
                >
                  {loading ? "Generating backup..." : "Download Backup File"}
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" mb={1} align="center">
                  Database Import (Restore)
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2} align="center">
                  Restore the application database schema to a previous state using a valid JSON backup file.
                </Typography>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Warning: All current PG tables records will be overwritten!
                </Alert>
                <form onSubmit={handleRestoreSubmit}>
                  <input
                    type="file"
                    accept=".json"
                    id="backup-file-input"
                    onChange={handleFileChange}
                    style={{ marginBottom: 15, display: "block" }}
                    disabled={saving}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="error"
                    startIcon={<UploadFileIcon />}
                    disabled={saving || !restoreFile}
                  >
                    {saving ? "Restoring..." : "Restore Database"}
                  </Button>
                </form>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  );
}

export default Settings;
