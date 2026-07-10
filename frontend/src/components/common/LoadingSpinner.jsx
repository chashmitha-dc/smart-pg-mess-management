import { Box, CircularProgress } from "@mui/material";

function LoadingSpinner({ message = "Loading..." }) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={4}>
      <CircularProgress />
      <Box color="text.secondary">{message}</Box>
    </Box>
  );
}

export default LoadingSpinner;
