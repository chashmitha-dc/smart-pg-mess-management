import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  Button,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function MealPlanTable({
  mealPlans,
  onEdit,
  onDelete,
}) {
  const isMobile = useMediaQuery("(max-width:767.95px)");

  if (mealPlans.length === 0) {
    return (
      <Paper
        sx={{
          p: 5,
          textAlign: "center",
        }}
      >
        <Typography variant="h6">
          No Meal Plans Found
        </Typography>

        <Typography color="text.secondary">
          Click "Add Meal Plan" to create one.
        </Typography>
      </Paper>
    );
  }

  if (isMobile) {
    return (
      <Box display="flex" flexDirection="column" gap={2} p={1.5}>
        {mealPlans.map((plan) => (
          <Card key={plan.plan_id} variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {plan.plan_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Plan ID: #{plan.plan_id}
                  </Typography>
                </Box>
                <Chip
                  label={plan.active ? "Active" : "Inactive"}
                  color={plan.active ? "success" : "default"}
                  size="small"
                />
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Grid container spacing={1} sx={{ mb: 1.5 }}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Breakfast
                  </Typography>
                  <Chip
                    label={plan.breakfast ? "Yes" : "No"}
                    color={plan.breakfast ? "success" : "default"}
                    size="small"
                  />
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Lunch
                  </Typography>
                  <Chip
                    label={plan.lunch ? "Yes" : "No"}
                    color={plan.lunch ? "success" : "default"}
                    size="small"
                  />
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Dinner
                  </Typography>
                  <Chip
                    label={plan.dinner ? "Yes" : "No"}
                    color={plan.dinner ? "success" : "default"}
                    size="small"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 1 }} />

              <Box display="flex" justifyContent="flex-end" gap={1} pt={0.5}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => onEdit(plan)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => onDelete(plan.plan_id)}
                >
                  Delete
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><b>ID</b></TableCell>
            <TableCell><b>Plan Name</b></TableCell>
            <TableCell><b>Breakfast</b></TableCell>
            <TableCell><b>Lunch</b></TableCell>
            <TableCell><b>Dinner</b></TableCell>
            <TableCell><b>Status</b></TableCell>
            <TableCell align="center">
              <b>Actions</b>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {mealPlans.map((plan) => (
            <TableRow key={plan.plan_id} hover>
              <TableCell>{plan.plan_id}</TableCell>
              <TableCell>{plan.plan_name}</TableCell>
              <TableCell>
                <Chip
                  label={plan.breakfast ? "Yes" : "No"}
                  color={plan.breakfast ? "success" : "default"}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={plan.lunch ? "Yes" : "No"}
                  color={plan.lunch ? "success" : "default"}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={plan.dinner ? "Yes" : "No"}
                  color={plan.dinner ? "success" : "default"}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={plan.active ? "Active" : "Inactive"}
                  color={plan.active ? "success" : "default"}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box display="flex" justifyContent="center">
                  <Tooltip title="Edit">
                    <IconButton color="primary" onClick={() => onEdit(plan)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => onDelete(plan.plan_id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default MealPlanTable;
