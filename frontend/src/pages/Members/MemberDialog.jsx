import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import MemberForm from "./MemberForm";

function MemberDialog({
  open,
  handleClose,
  handleSubmit,
  formData,
  handleChange,
  mealPlans = [],
  loading,
  editMode,
}) {
  const hasNoPlans = mealPlans.length === 0;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editMode ? "Edit Member" : "Add Member"}
      </DialogTitle>

      <DialogContent>
        <MemberForm
          formData={formData}
          handleChange={handleChange}
          mealPlans={mealPlans}
          handleClose={handleClose}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || hasNoPlans}
        >
          {loading
            ? "Saving..."
            : editMode
            ? "Update"
            : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MemberDialog;