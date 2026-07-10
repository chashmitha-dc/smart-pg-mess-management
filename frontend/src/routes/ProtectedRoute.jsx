import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoute({ children, allowedRole }) {
  const { loading, isAuthenticated, role, user } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#f5f7fb",
        }}
      >
        <CircularProgress size={45} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    const isMember = allowedRole === "member";
    return <Navigate to={isMember ? "/member/login" : "/login"} replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === "member" ? "/member/dashboard" : "/dashboard"} replace />;
  }

  return children;
}

export default ProtectedRoute;