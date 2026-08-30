import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { useAuth } from "../../hooks/useAuth";

// Simple fade‑in animation (re‑usable)
const fadeIn = {
  animation: "fadeIn 0.8s ease-out",
  "@keyframes fadeIn": {
    "0%": { opacity: 0 },
    "100%": { opacity: 1 },
  },
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { loading, isAuthenticated, role } = useAuth();

  // Redirect authenticated users to the appropriate dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (role === "member") {
        navigate("/member/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [loading, isAuthenticated, role, navigate]);

  // While auth state resolves, avoid flashing the landing page
  if (loading) return null;

  return (
    <Box sx={{ backgroundColor: "#f5f7fb", minHeight: "100vh" }} {...fadeIn}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        {/* HERO SECTION */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
            color: "#fff",
            textAlign: "center",
            borderRadius: 2,
            py: 8,
            mb: 8,
            px: 2,
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
            SmartPG &amp; Mess
          </Typography>
          <Typography variant="h5" gutterBottom>
            Smart PG &amp; Mess Management Made Simple
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 600, mx: "auto", mb: 4 }}>
            Manage residents, meals, billing, leaves, payments and complaints from one simple platform.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/login")}
              sx={{ borderRadius: 3, px: 4, py: 1.5 }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/login")}
              sx={{ borderRadius: 3, px: 4, py: 1.5, color: "#fff", borderColor: "#fff" }}
            >
              Login
            </Button>
          </Box>
        </Box>

        {/* FEATURES SECTION */}
        <Box sx={{ mb: 8 }}>
          <Grid container spacing={4}>
            {[
              { title: "Member Management", desc: "Manage PG residents and their information." },
              { title: "Meal Plans & Pricing", desc: "Configure meal plans and dynamic meal pricing." },
              { title: "Leave Management", desc: "Review and manage resident leave requests." },
              { title: "Billing & Invoicing", desc: "Generate and manage resident bills." },
              { title: "Payments", desc: "Track payment status and outstanding balances." },
              { title: "Complaints", desc: "Manage resident complaints and requests." },
              { title: "AI Food Prediction", desc: "Use the existing food prediction functionality." },
            ].map((feature) => (
              <Grid item xs={12} sm={6} md={4} key={feature.title}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#1d4ed8" }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#4b5563" }}>
                      {feature.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* HOW IT WORKS SECTION */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, textAlign: "center", color: "#1d4ed8" }}>
            How It Works
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {[
              { step: "1", title: "Register / Login", desc: "Create an account or sign in to get started." },
              { step: "2", title: "Manage Your PG", desc: "Add members, configure meals, and handle leaves." },
              { step: "3", title: "Track Meals, Leaves & Payments", desc: "Monitor daily operations and financials." },
            ].map((item) => (
              <Grid item xs={12} sm={4} key={item.step}>
                <Card sx={{ textAlign: "center", borderRadius: 2, p: 2, transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
                  <Typography variant="h3" sx={{ color: "#1d4ed8", fontWeight: 800 }}>
                    {item.step}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mt: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#4b5563", mt: 0.5 }}>
                    {item.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* USER TYPES SECTION */}
        <Box sx={{ mb: 8 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, borderRadius: 2, backgroundColor: "#e0f2fe", height: "100%" }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "#1d4ed8" }}>
                  OWNER
                </Typography>
                <Typography variant="body1" sx={{ color: "#374151" }}>
                  Manage your PG, members, meals, billing, payments and complaints.
                </Typography>
                <Button variant="contained" sx={{ mt: 2, borderRadius: 3 }} onClick={() => navigate("/login")}>Owner Login</Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, borderRadius: 2, backgroundColor: "#e5e7eb", height: "100%" }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "#1d4ed8" }}>
                  MEMBER
                </Typography>
                <Typography variant="body1" sx={{ color: "#374151" }}>
                  View your bills, apply for leave, raise complaints and receive announcements.
                </Typography>
                <Button variant="contained" sx={{ mt: 2, borderRadius: 3 }} onClick={() => navigate("/login")}>Member Login</Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* WHY SMARTPG SECTION */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, textAlign: "center", color: "#1d4ed8" }}>
            Why SmartPG &amp; Mess?
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {[
              "Centralized PG management",
              "Automated billing",
              "Digital leave management",
              "Transparent payment tracking",
              "Better communication between owners and residents",
              "Data-driven food planning",
            ].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#1d4ed8" }} />
                  <Typography variant="body2" sx={{ color: "#4b5563" }}>{item}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA SECTION */}
        <Box sx={{ textAlign: "center", py: 6, backgroundColor: "#dbeafe", borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "#1d4ed8" }}>
            Ready to simplify your PG management?
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 3, color: "#374151" }}>
            Manage your PG smarter with SmartPG &amp; Mess.
          </Typography>
          <Button variant="contained" size="large" onClick={() => navigate("/login")} sx={{ borderRadius: 3 }}>
            Get Started
          </Button>
        </Box>

        {/* FOOTER */}
        <Box sx={{ textAlign: "center", mt: 6, py: 4, borderTop: "1px solid #e5e7eb" }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1d4ed8" }}>
            SmartPG &amp; Mess
          </Typography>
          <Typography variant="caption" sx={{ color: "#6b7280" }}>
            © 2026 SmartPG &amp; Mess
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
