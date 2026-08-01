import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

function DashboardCard({ title, value, subtitle, icon, color = "primary" }) {
  return (
    <Card sx={{ height: "100%", borderRadius: "8px", boxShadow: "0 4px 16px rgba(0,0,0,0.04)", border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="text.secondary" variant="body2" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
              {value}
            </Typography>
            {subtitle ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: "0.7rem", sm: "0.875rem" } }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          <Box sx={{ color: `${color}.main`, fontSize: { xs: 24, sm: 32 } }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default DashboardCard;
