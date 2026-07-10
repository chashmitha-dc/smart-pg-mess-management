import {
  Grid,
  MenuItem,
  TextField,
  Box,
  Typography,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function MemberForm({
  formData,
  handleChange,
  mealPlans = [],
  handleClose,
}) {
  const navigate = useNavigate();

  if (mealPlans.length === 0) {
    return (
      <Box
        mt={2}
        p={3}
        sx={{
          border: "1px dashed #d32f2f",
          borderRadius: 2,
          textAlign: "center",
          bgcolor: "#fdf2f2",
        }}
      >
        <Typography color="error" variant="body1" mb={2} fontWeight="bold">
          No Meal Plans Available
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          You must create at least one active meal plan before registering members.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            if (handleClose) handleClose();
            navigate("/meal-plans");
          }}
        >
          Create Meal Plan
        </Button>
      </Box>
    );
  }

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          label="Member Name"
          name="member_name"
          value={formData.member_name}
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          inputProps={{ maxLength: 10 }}
          helperText="Must be exactly 10 digits"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Password (Optional)"
          name="password"
          type="password"
          value={formData.password || ""}
          onChange={handleChange}
          helperText="If blank, defaults to their phone number"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          select
          label="Meal Plan"
          name="current_plan_id"
          value={formData.current_plan_id}
          onChange={handleChange}
        >
          {mealPlans
            .filter((plan) => plan.active)
            .map((plan) => (
              <MenuItem key={plan.plan_id} value={plan.plan_id}>
                {plan.plan_name}
              </MenuItem>
            ))}
        </TextField>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Emergency Contact (Optional)"
          name="emergency_contact"
          value={formData.emergency_contact}
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          label="Joining Date"
          name="joining_date"
          type="date"
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: new Date().toISOString().split("T")[0] }}
          value={formData.joining_date}
          onChange={handleChange}
        />
      </Grid>
    </Grid>
  );
}

export default MemberForm;