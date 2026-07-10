import { Card, CardContent, Stack, Typography } from "@mui/material";

function DashboardCard({ title, value, subtitle, icon, color = "primary" }) {
  return (
    <Card sx={{ height: "100%", borderRadius: 3 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="text.secondary" variant="body2">
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
              {value}
            </Typography>
            {subtitle ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          <Box sx={{ color: `${color}.main`, fontSize: 32 }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default DashboardCard;
