import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
} from "@mui/material";

function MealPlanDialog({
  open,
  handleClose,
  handleSubmit,
  formData,
  handleChange,
  handleSwitchChange,
  loading,
  editMode,
}) {
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle fontWeight="bold">
        {editMode ? "Edit Meal Plan" : "Add Meal Plan"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Plan Name"
              name="plan_name"
              value={formData.plan_name}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.breakfast}
                  onChange={(e) => handleSwitchChange("breakfast", e.target.checked)}
                  name="breakfast"
                  color="primary"
                />
              }
              label="Includes Breakfast"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.lunch}
                  onChange={(e) => handleSwitchChange("lunch", e.target.checked)}
                  name="lunch"
                  color="primary"
                />
              }
              label="Includes Lunch"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.dinner}
                  onChange={(e) => handleSwitchChange("dinner", e.target.checked)}
                  name="dinner"
                  color="primary"
                />
              }
              label="Includes Dinner"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => handleSwitchChange("active", e.target.checked)}
                  name="active"
                  color="success"
                />
              }
              label="Status (Active)"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          color="primary"
        >
          {loading ? "Saving..." : editMode ? "Update" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MealPlanDialog;
