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
  TableSortLabel,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function MemberTable({
  members,
  mealPlans = [],
  onEdit,
  onDelete,
  sortField,
  sortOrder,
  onSort,
}) {
  if (members.length === 0) {
    return (
      <Paper sx={{ p: 5, textAlign: "center" }}>
        <Typography variant="h6">No Members Found</Typography>
        <Typography color="text.secondary">
          Click "Add Member" to create your first member.
        </Typography>
      </Paper>
    );
  }

  const renderSortableHeader = (field, label) => {
    const isSorted = sortField === field;
    return (
      <TableCell>
        <TableSortLabel
          active={isSorted}
          direction={isSorted ? sortOrder : "asc"}
          onClick={() => onSort(field)}
          sx={{ fontWeight: "bold" }}
        >
          {label}
        </TableSortLabel>
      </TableCell>
    );
  };

  return (
    <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
      <Table>
        <TableHead>
          <TableRow>
            {renderSortableHeader("member_id", "ID")}
            {renderSortableHeader("member_name", "Member Name")}
            {renderSortableHeader("email", "Email")}
            {renderSortableHeader("phone", "Phone")}
            {renderSortableHeader("current_plan_id", "Meal Plan")}
            {renderSortableHeader("joining_date", "Joining Date")}
            {renderSortableHeader("status", "Status")}
            <TableCell align="center">
              <b>Actions</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.member_id} hover>
              <TableCell>{member.member_id}</TableCell>
              <TableCell>{member.member_name}</TableCell>
              <TableCell>{member.email || "-"}</TableCell>
              <TableCell>{member.phone}</TableCell>
              <TableCell>
                {mealPlans.find((p) => p.plan_id === member.current_plan_id)?.plan_name ||
                  `Plan ID: ${member.current_plan_id}`}
              </TableCell>
              <TableCell>
                {member.joining_date
                  ? new Date(member.joining_date).toLocaleDateString()
                  : ""}
              </TableCell>
              <TableCell>
                <Chip
                  label={member.status}
                  color={member.status === "active" ? "success" : "default"}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box display="flex" justifyContent="center">
                  <Tooltip title="Edit">
                    <IconButton color="primary" onClick={() => onEdit(member)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => onDelete(member.member_id)}>
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

export default MemberTable;