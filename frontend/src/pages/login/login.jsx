import { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Lock,
  Mail,
  Phone,
  Home,
  Person,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";
import { registerOwner, forgotPassword, resetPassword } from "../../api/authApi";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isMember, setIsMember] = useState(
    window.location.pathname.includes("/member")
  );

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // SaaS Dialog States
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    pg_name: "",
    pg_address: "",
  });

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotForm, setForgotForm] = useState({
    identity: "",
  });

  const [resetOpen, setResetOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetForm, setResetForm] = useState({
    identity: "",
    reset_code: "",
    new_password: "",
    confirm_password: "",
  });

  // Sync state with URL path updates
  useEffect(() => {
    const handlePopState = () => {
      setIsMember(window.location.pathname.includes("/member"));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleToggle = (role) => {
    const memberMode = role === "member";
    setIsMember(memberMode);
    setError("");
    window.history.replaceState(
      null,
      "",
      memberMode ? "/member/login" : "/login"
    );
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleRegisterChange = (e) => {
    setRegisterForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setRegisterError("");
  };

  const handleForgotChange = (e) => {
    setForgotForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setForgotError("");
  };

  const handleResetChange = (e) => {
    setResetForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setResetError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isMember) {
      if (!formData.phone.trim()) {
        setError("Phone number is required");
        return;
      }
      if (formData.phone.length !== 10 || !/^\d+$/.test(formData.phone)) {
        setError("Phone number must be exactly 10 digits");
        return;
      }
    } else {
      if (!formData.email.trim()) {
        setError("Email is required");
        return;
      }
    }

    if (!formData.password.trim()) {
      setError("Password is required");
      return;
    }

    try {
      setLoading(true);

      if (isMember) {
        await login(
          { phone: formData.phone, password: formData.password },
          true
        );
        toast.success("Member Login Successful");
        navigate("/member/dashboard", { replace: true });
      } else {
        await login(
          { email: formData.email, password: formData.password },
          false
        );
        toast.success("Owner Login Successful");
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || "Invalid credentials. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!registerForm.name.trim() || !registerForm.email.trim() || !registerForm.phone.trim() || !registerForm.password.trim() || !registerForm.pg_name.trim() || !registerForm.pg_address.trim()) {
      setRegisterError("All fields are required");
      return;
    }

    if (registerForm.password.length < 8) {
      setRegisterError("Password must be at least 8 characters");
      return;
    }

    if (registerForm.password !== registerForm.confirm_password) {
      setRegisterError("Passwords do not match");
      return;
    }

    try {
      setRegisterLoading(true);
      const res = await registerOwner({
        name: registerForm.name,
        email: registerForm.email,
        phone: registerForm.phone,
        password: registerForm.password,
        pg_name: registerForm.pg_name,
        pg_address: registerForm.pg_address,
      });

      // Extract generated token for automatic login
      const { access_token, role } = res.data.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("role", role);

      // Perform AuthContext loadUser triggers
      await login({ email: registerForm.email, password: registerForm.password }, false);

      toast.success("Registered and logged in successfully!");
      setRegisterOpen(false);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || "Registration failed. Please check inputs.";
      setRegisterError(message);
      toast.error(message);
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();

    if (!forgotForm.identity.trim()) {
      setForgotError("Identity is required");
      return;
    }

    try {
      setForgotLoading(true);
      const res = await forgotPassword({ identity: forgotForm.identity });
      const { reset_code, email_sent, role } = res.data.data;

      if (email_sent) {
        // Email was delivered — ask user to check inbox
        toast.success("OTP sent to your email! Check your inbox.", { duration: 6000 });
        setResetForm({
          identity: forgotForm.identity,
          reset_code: "",   // user must enter OTP from email
          new_password: "",
          confirm_password: "",
        });
      } else {
        // SMTP not configured — show OTP directly (dev/no-email mode)
        toast.success(`Your OTP: ${reset_code}`, { duration: 15000, icon: "🔑" });
        setResetForm({
          identity: forgotForm.identity,
          reset_code: reset_code,
          new_password: "",
          confirm_password: "",
        });
      }

      setForgotOpen(false);
      setResetOpen(true);
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || "Recovery lookup failed.";
      setForgotError(message);
      toast.error(message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    if (!resetForm.reset_code.trim() || !resetForm.new_password.trim()) {
      setResetError("All fields are required");
      return;
    }

    if (resetForm.new_password.length < 8) {
      setResetError("Password must be at least 8 characters");
      return;
    }

    if (resetForm.new_password !== resetForm.confirm_password) {
      setResetError("Passwords do not match");
      return;
    }

    try {
      setResetLoading(true);
      await resetPassword({
        identity: resetForm.identity,
        reset_code: resetForm.reset_code,
        new_password: resetForm.new_password,
      });

      toast.success("Password reset successfully! Log in to continue.");
      setResetOpen(false);
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || "Reset failed. Code may have expired.";
      setResetError(message);
      toast.error(message);
    } finally {
      setResetLoading(false);
    }
  };

  const themeColor = isMember ? "#ec4899" : "#1d4ed8";
  const hoverColor = isMember ? "#be185d" : "#1e3a8a";

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
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(2px)",
          zIndex: 1,
        },
      }}
    >
      <Card
        elevation={12}
        sx={{
          width: 900,
          maxWidth: "95vw",
          height: { xs: "auto", md: 540 },
          display: "flex",
          borderRadius: 6,
          overflow: "hidden",
          zIndex: 2,
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        }}
      >
        {/* Left Side Panel */}
        <Box
          sx={{
            width: { xs: "0%", md: "40%" },
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: 4,
            textAlign: "center",
            background: isMember
              ? "linear-gradient(135deg, #ec4899, #be185d)"
              : "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
            color: "white",
            transition: "background 0.6s ease-in-out",
          }}
        >
          {/* Stylized Modern Home & Dining Logo */}
          <Box
            sx={{
              mb: 3,
              filter: "drop-shadow(0px 4px 10px rgba(0, 0, 0, 0.25))",
            }}
          >
            <svg
              width="110"
              height="110"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                stroke="#e9c46a"
                strokeWidth="3.5"
                fill="rgba(255, 255, 255, 0.08)"
              />
              <path
                d="M50 18 L82 44 V78 C82 80 80 82 78 82 H22 C20 82 18 80 18 78 V44 L50 18 Z"
                stroke="#ffffff"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M42 42 V64"
                stroke="#e9c46a"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M37 42 H47"
                stroke="#e9c46a"
                strokeWidth="2.5"
              />
              <path
                d="M58 42 C58 52 58 52 58 64"
                stroke="#e9c46a"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M54 42 C54 48 62 48 62 42"
                stroke="#e9c46a"
                strokeWidth="2.5"
              />
            </svg>
          </Box>

          <Typography
            variant="h6"
            sx={{ opacity: 0.9, letterSpacing: 1, textTransform: "uppercase" }}
          >
            Welcome to
          </Typography>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ mt: 1, letterSpacing: 0.5 }}
          >
            Smart Mess Portal
          </Typography>
        </Box>

        {/* Right Side Panel */}
        <Box
          sx={{
            width: { xs: "100%", md: "60%" },
            p: { xs: 4, md: 5 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "background.paper",
          }}
        >
          {/* Top Toggle Switch Pill */}
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Box
              sx={{
                backgroundColor: "#f0f2f5",
                borderRadius: "24px",
                p: "4px",
                display: "flex",
                border: "1px solid #e0e0e0",
              }}
            >
              <Box
                onClick={() => handleToggle("owner")}
                sx={{
                  backgroundColor: !isMember ? "#1d4ed8" : "transparent",
                  color: !isMember ? "#ffffff" : "#757575",
                  borderRadius: "20px",
                  px: 3,
                  py: 0.8,
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  userSelect: "none",
                }}
              >
                Owner
              </Box>
              <Box
                onClick={() => handleToggle("member")}
                sx={{
                  backgroundColor: isMember ? "#ec4899" : "transparent",
                  color: isMember ? "#ffffff" : "#757575",
                  borderRadius: "20px",
                  px: 3,
                  py: 0.8,
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  userSelect: "none",
                }}
              >
                Member
              </Box>
            </Box>
          </Box>

          {/* Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            autoComplete="off"
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flexGrow: 1,
            }}
          >
            <Typography variant="h5" align="center" fontWeight="bold">
              {isMember ? "Member Login" : "Owner Login"}
            </Typography>

            {/* Slide animated bar */}
            <Box
              sx={{
                width: 70,
                height: 3,
                backgroundColor: themeColor,
                margin: "10px auto 25px auto",
                borderRadius: 1,
                transition: "background-color 0.6s ease",
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {isMember ? (
              <TextField
                required
                fullWidth
                label="Registered Phone Number"
                name="phone"
                type="tel"
                autoComplete="username"
                value={formData.phone}
                onChange={handleChange}
                inputProps={{ maxLength: 10 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: themeColor, transition: "color 0.6s ease" }} />
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
            ) : (
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                autoComplete="username"
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail sx={{ color: themeColor, transition: "color 0.6s ease" }} />
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
            )}

            <TextField
              required
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: themeColor, transition: "color 0.6s ease" }} />
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
                mb: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "24px",
                },
              }}
            />

            {/* Checkbox and Forgot Password Link */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} width="100%">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    sx={{
                      color: themeColor,
                      "&.Mui-checked": {
                        color: themeColor,
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    Show Password
                  </Typography>
                }
              />
              <Link
                component="button"
                variant="body2"
                type="button"
                onClick={() => {
                  setForgotForm({ identity: isMember ? formData.phone : formData.email });
                  setForgotOpen(true);
                }}
                underline="hover"
                sx={{ color: themeColor, fontWeight: "bold" }}
              >
                Forgot Password?
              </Link>
            </Box>

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
                backgroundColor: themeColor,
                "&:hover": {
                  backgroundColor: hoverColor,
                },
                transition: "background-color 0.6s ease",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "LOGIN"}
            </Button>

            {/* SaaS Create Account Link (Owner Only) */}
            {!isMember && (
              <Box textAlign="center" mt={2}>
                <Link
                  component="button"
                  variant="body2"
                  type="button"
                  onClick={() => setRegisterOpen(true)}
                  underline="hover"
                  sx={{ color: themeColor, fontWeight: "bold" }}
                >
                  Create Account
                </Link>
              </Box>
            )}
          </Box>

          <Typography variant="caption" color="text.secondary" align="center">
            SmartPG Digital Mess Security Portal • © 2026 All rights reserved.
          </Typography>
        </Box>
      </Card>

      {/* SaaS Register Dialog (Owner Registration) */}
      <Dialog open={registerOpen} onClose={() => setRegisterOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold" }}>Owner Registration</DialogTitle>
        <DialogContent>
          {registerError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {registerError}
            </Alert>
          )}
          <Box component="form" onSubmit={handleRegisterSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              required
              fullWidth
              label="Owner Full Name"
              name="name"
              value={registerForm.name}
              onChange={handleRegisterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              required
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={registerForm.email}
              onChange={handleRegisterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              required
              fullWidth
              label="Phone Number"
              name="phone"
              value={registerForm.phone}
              onChange={handleRegisterChange}
              inputProps={{ maxLength: 10 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              required
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={registerForm.password}
              onChange={handleRegisterChange}
              helperText="At least 8 characters"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              required
              fullWidth
              label="Confirm Password"
              name="confirm_password"
              type="password"
              value={registerForm.confirm_password}
              onChange={handleRegisterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              required
              fullWidth
              label="PG / Mess Name"
              name="pg_name"
              value={registerForm.pg_name}
              onChange={handleRegisterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              required
              fullWidth
              label="PG Address"
              name="pg_address"
              value={registerForm.pg_address}
              onChange={handleRegisterChange}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setRegisterOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleRegisterSubmit}
            variant="contained"
            color="primary"
            disabled={registerLoading}
          >
            {registerLoading ? <CircularProgress size={24} color="inherit" /> : "REGISTER"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SaaS Forgot Password Dialog */}
      <Dialog open={forgotOpen} onClose={() => setForgotOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: "bold" }}>Forgot Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Enter your email (for Owners) or phone number (for Members) to receive a password reset code.
          </Typography>
          {forgotError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {forgotError}
            </Alert>
          )}
          <Box component="form" onSubmit={handleForgotSubmit} sx={{ mt: 1 }}>
            <TextField
              required
              fullWidth
              label="Email or Phone Number"
              name="identity"
              value={forgotForm.identity}
              onChange={handleForgotChange}
              placeholder="e.g. owner@example.com or 9876543210"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setForgotOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleForgotSubmit}
            variant="contained"
            color="primary"
            disabled={forgotLoading}
          >
            {forgotLoading ? <CircularProgress size={24} color="inherit" /> : "GET CODE"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SaaS Reset Password Dialog */}
      <Dialog open={resetOpen} onClose={() => setResetOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: "bold" }}>Reset Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Enter the 6-digit code sent to your screen and choose your new password.
          </Typography>
          {resetError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {resetError}
            </Alert>
          )}
          <Box component="form" onSubmit={handleResetSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              required
              fullWidth
              label="Verification Code"
              name="reset_code"
              value={resetForm.reset_code}
              onChange={handleResetChange}
              placeholder="6-digit code"
            />
            <TextField
              required
              fullWidth
              label="New Password"
              name="new_password"
              type="password"
              value={resetForm.new_password}
              onChange={handleResetChange}
              helperText="At least 8 characters"
            />
            <TextField
              required
              fullWidth
              label="Confirm New Password"
              name="confirm_password"
              type="password"
              value={resetForm.confirm_password}
              onChange={handleResetChange}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setResetOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleResetSubmit}
            variant="contained"
            color="primary"
            disabled={resetLoading}
          >
            {resetLoading ? <CircularProgress size={24} color="inherit" /> : "RESET PASSWORD"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Login;