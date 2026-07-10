import { Box, Button, Typography } from "@mui/material";

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <Box textAlign="center" py={6}>
      <Typography variant="h6">{title}</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
        {description}
      </Typography>
      {actionLabel && onAction ? (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Box>
  );
}

export default EmptyState;
