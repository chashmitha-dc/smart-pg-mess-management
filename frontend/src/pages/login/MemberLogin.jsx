import { useState } from "react";
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
  Paper,
  TextField,
  Typography,
  Link,
  Grid,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Group,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";

function MemberLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
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

    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return;
    }

    if (!formData.password.trim()) {
      setError("Password is required");
      return;
    }

    try {
      setLoading(true);
      await login(formData, true);
      toast.success("Member Login Successful");
      navigate("/member/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.message || "Invalid phone number or password";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={false} disableGutters>
      <Grid container sx={{ minHeight: "100vh" }}>
        {/* Left Side */}
        <Grid
          size={{ xs: 0, md: 6 }}
          sx={{
            display: {
              xs: "none",
              md: "flex",
            },
            background:
              "linear-gradient(135deg,#00b4db,#0083b0)",
            color: "white",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            p: 6,
          }}
        >
          <Group sx={{ fontSize: 90, mb: 3 }} />

          <Typography
            variant="h3"
            fontWeight="bold"
            gutterBottom
          >
            Member Hub
          </Typography>

          <Typography
            variant="h5"
            textAlign="center"
          >
            Access your Mess Accounts & Meal Plans
          </Typography>

          <Typography
            mt={4}
            textAlign="center"
            sx={{ opacity: 0.85 }}
          >
            Submit leave absences, review monthly bills, upload payment proofs,
            check menu details and submit complaints instantly.
          </Typography>
        </Grid>

        {/* Right Side */}
        <Grid
          size={{ xs: 12, md: 6 }}
          component={Paper}
          square
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "#f5f7fb",
          }}
        >
          <Card
            elevation={5}
            sx={{
              width: 430,
              borderRadius: 4,
            }}
          >
            <CardContent sx={{ p: 5 }}>
              <Typography
                variant="h4"
                align="center"
                gutterBottom
                fontWeight="bold"
              >
                Member Sign In
              </Typography>

              <Typography
                align="center"
                color="text.secondary"
                mb={4}
              >
                Sign in to view your PG meals dashboard
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={handleSubmit}
              >
                <TextField
                  fullWidth
                  label="Registered Phone Number"
                  name="phone"
                  margin="normal"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  margin="normal"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowPassword(
                              !showPassword
                            )
                          }
                        >
                          {showPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  sx={{ mt: 4, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress
                      size={24}
                      color="inherit"
                    />
                  ) : (
                    "Login"
                  )}
                </Button>

                <Box textAlign="center" mt={2}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate("/login")}
                    underline="hover"
                  >
                    Are you a PG Owner? Sign in here
                  </Link>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default MemberLogin;
