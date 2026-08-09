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
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Chip,
  InputAdornment,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SettingsIcon from "@mui/icons-material/Settings";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import SearchIcon from "@mui/icons-material/Search";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import toast from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";
import { updateOwnerProfile } from "../../api/authApi";
import { getBackupFile, uploadRestoreFile } from "../../api/backupApi";
import { getBillingIncrementSettings, updateBillingIncrementSettings } from "../../api/ownerApi";

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

  // Billing Increment state
  const [incrementLoading, setIncrementLoading] = useState(false);
  const [savingIncrement, setSavingIncrement] = useState(false);
  const [baseAmount, setBaseAmount] = useState(3000);
  const [incrementAmount, setIncrementAmount] = useState(200);
  const [membersList, setMembersList] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

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

  const loadIncrementSettings = async () => {
    setIncrementLoading(true);
    try {
      const res = await getBillingIncrementSettings();
      const data = res.data.data;
      setBaseAmount(data.base_monthly_amount || 3000);
      setIncrementAmount(data.increment_amount || 200);
      const members = data.members || [];
      setMembersList(members);
      const selected = members.filter((m) => m.selected).map((m) => m.member_id);
      setSelectedMemberIds(selected);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load billing increment settings");
    } finally {
      setIncrementLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 2) {
      loadIncrementSettings();
    }
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

      const fileInput = document.getElementById("backup-file-input");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Restore failed", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // Billing Increment Handlers
  const handleSelectAll = () => {
    const allIds = membersList.map((m) => m.member_id);
    setSelectedMemberIds(allIds);
  };

  const handleClearAll = () => {
    setSelectedMemberIds([]);
  };

  const handleMemberToggle = (memberId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSaveIncrement = async (e) => {
    e.preventDefault();
    const amt = parseFloat(incrementAmount);
    if (isNaN(amt) || amt < 0) {
      toast.error("Please enter a valid non-negative increment amount");
      return;
    }

    setSavingIncrement(true);
    try {
      const payload = {
        increment_amount: amt,
        selected_member_ids: selectedMemberIds,
      };
      await updateBillingIncrementSettings(payload);
      toast.success("Billing increment settings saved successfully!");
      loadIncrementSettings();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save billing increment settings");
    } finally {
      setSavingIncrement(false);
    }
  };

  const filteredMembers = membersList.filter(
    (m) =>
      m.member_name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      m.phone.includes(memberSearchQuery)
  );

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
            <Tab label="Billing Increment / Member-Specific Increment" />
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

        {tabValue === 2 && (
          <Box component="form" onSubmit={handleSaveIncrement}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Configure member-specific billing increments. Unselected members will remain at the standard base monthly billing rate of ₹{baseAmount}. Selected members will be billed at ₹{baseAmount} + ₹{incrementAmount || 0} = ₹{baseAmount + (parseFloat(incrementAmount) || 0)}. Leave deductions (₹100/day for 7+ continuous days) remain unaffected.
            </Alert>

            {incrementLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Base Monthly Amount (Standard)"
                    value={`₹${baseAmount}`}
                    InputProps={{ readOnly: true }}
                    helperText="Standard monthly fee for all members"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Increment Amount (₹)"
                    type="number"
                    value={incrementAmount}
                    onChange={(e) => setIncrementAmount(e.target.value)}
                    required
                    inputProps={{ min: 0, step: 50 }}
                    helperText="Amount added to base bill for selected members"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Box
                        display="flex"
                        flexDirection={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        gap={2}
                        mb={2}
                      >
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            Select Members for Increment
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Selected: {selectedMemberIds.length} of {membersList.length} member(s)
                          </Typography>
                        </Box>
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<SelectAllIcon />}
                            onClick={handleSelectAll}
                          >
                            Select All
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="inherit"
                            startIcon={<ClearAllIcon />}
                            onClick={handleClearAll}
                          >
                            Clear All
                          </Button>
                        </Box>
                      </Box>

                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Search member by name or phone..."
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 2 }}
                      />

                      <Divider sx={{ mb: 2 }} />

                      {filteredMembers.length === 0 ? (
                        <Typography color="text.secondary" align="center" py={2}>
                          No active members found.
                        </Typography>
                      ) : (
                        <Grid container spacing={1} sx={{ maxHeight: 300, overflowY: "auto" }}>
                          {filteredMembers.map((member) => {
                            const isSelected = selectedMemberIds.includes(member.member_id);
                            return (
                              <Grid item xs={12} sm={6} key={member.member_id}>
                                <Paper
                                  variant="outlined"
                                  onClick={() => handleMemberToggle(member.member_id)}
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    cursor: "pointer",
                                    bgcolor: isSelected ? "#f0f7ff" : "background.paper",
                                    borderColor: isSelected ? "primary.main" : "divider",
                                    transition: "all 0.2s",
                                    "&:hover": {
                                      borderColor: "primary.main",
                                    },
                                  }}
                                >
                                  <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={isSelected}
                                          onChange={() => handleMemberToggle(member.member_id)}
                                          color="primary"
                                        />
                                      }
                                      label={
                                        <Box>
                                          <Typography variant="subtitle2" fontWeight="bold">
                                            {member.member_name}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            Phone: {member.phone}
                                          </Typography>
                                        </Box>
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      sx={{ m: 0 }}
                                    />
                                    <Chip
                                      size="small"
                                      label={
                                        isSelected
                                          ? `₹${baseAmount + (parseFloat(incrementAmount) || 0)}`
                                          : `₹${baseAmount}`
                                      }
                                      color={isSelected ? "primary" : "default"}
                                      variant={isSelected ? "filled" : "outlined"}
                                    />
                                  </Box>
                                </Paper>
                              </Grid>
                            );
                          })}
                        </Grid>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      disabled={savingIncrement}
                      sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                      {savingIncrement ? "Saving Settings..." : "Save Settings"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default Settings;
