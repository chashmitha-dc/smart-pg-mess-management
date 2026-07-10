import {
  Box,
  Chip,
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
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function MealPlanTable({
  mealPlans,
  onEdit,
  onDelete,
}) {
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

  return (
    <TableContainer component={Paper}>
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
                  label={
                    plan.breakfast
                      ? "Yes"
                      : "No"
                  }
                  color={
                    plan.breakfast
                      ? "success"
                      : "default"
                  }
                  size="small"
                />
              </TableCell>

              <TableCell>
                <Chip
                  label={
                    plan.lunch
                      ? "Yes"
                      : "No"
                  }
                  color={
                    plan.lunch
                      ? "success"
                      : "default"
                  }
                  size="small"
                />
              </TableCell>

              <TableCell>
                <Chip
                  label={
                    plan.dinner
                      ? "Yes"
                      : "No"
                  }
                  color={
                    plan.dinner
                      ? "success"
                      : "default"
                  }
                  size="small"
                />
              </TableCell>

              <TableCell>
                <Chip
                  label={
                    plan.active
                      ? "Active"
                      : "Inactive"
                  }
                  color={
                    plan.active
                      ? "success"
                      : "default"
                  }
                  size="small"
                />
              </TableCell>

              <TableCell>

                <Box
                  display="flex"
                  justifyContent="center"
                >

                  <Tooltip title="Edit">
                    <IconButton
                      color="primary"
                      onClick={() =>
                        onEdit(plan)
                      }
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete">
                    <IconButton
                      color="error"
                      onClick={() =>
                        onDelete(plan.plan_id)
                      }
                    >
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