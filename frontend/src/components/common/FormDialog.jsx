import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

function FormDialog({ open, title, onClose, onSubmit, submitLabel = "Save", children }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit}>
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FormDialog;
