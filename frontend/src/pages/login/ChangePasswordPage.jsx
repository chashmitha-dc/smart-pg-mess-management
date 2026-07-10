import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  TextField,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff, Lock } from "@mui/icons-material";
import toast from "react-hot-toast";
import { changePassword } from "../../api/authApi";

function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.current_password.trim()) {
      setError("Current password is required");
      return;
    }
    if (!formData.new_password.trim()) {
      setError("New password is required");
      return;
    }
    if (formData.new_password.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (formData.new_password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await changePassword({
        current_password: formData.current_password,
        new_password: formData.new_password,
      });

      toast.success("Password changed successfully! Welcome to SmartPG.");
      // Reload session to refresh user.is_first_login check
      window.location.reload();
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.message || "Failed to update password. Please check current password.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        background: "url(/login_background.png) no-repeat center center fixed",
        backgroundSize: "cover",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.35)",
          backdropFilter: "blur(2px)",
          zIndex: 1,
        },
      }}
    >
      <Container maxWidth="xs" sx={{ zIndex: 2 }}>
        <Card sx={{ borderRadius: 4, overflow: "hidden", boxShadow: 12 }}>
          <Box
            sx={{
              background: "linear-gradient(135deg, #ec4899, #be185d)",
              color: "white",
              p: 3,
              textAlign: "center",
            }}
          >
            <Lock sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" fontWeight="bold">
              Secure Your Account
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              This is your first login. Please choose a new password.
            </Typography>
          </Box>
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                required
                fullWidth
                label="Current Password"
                name="current_password"
                type={showPassword ? "text" : "password"}
                placeholder="Default (your phone number)"
                value={formData.current_password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#ec4899" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "24px",
                  },
                }}
              />

              <TextField
                required
                fullWidth
                label="New Password"
                name="new_password"
                type={showPassword ? "text" : "password"}
                value={formData.new_password}
                onChange={handleChange}
                helperText="At least 8 characters"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#ec4899" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "24px",
                  },
                }}
              />

              <TextField
                required
                fullWidth
                label="Confirm New Password"
                name="confirm_password"
                type={showPassword ? "text" : "password"}
                value={formData.confirm_password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#ec4899" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "24px",
                  },
                }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={loading}
                sx={{
                  borderRadius: "24px",
                  py: 1.5,
                  fontWeight: "bold",
                  backgroundColor: "#ec4899",
                  "&:hover": {
                    backgroundColor: "#be185d",
                  },
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "CHANGE PASSWORD"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default ChangePasswordPage;
