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
  TableSortLabel,
  useMediaQuery,
  Button,
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
  const isMobile = useMediaQuery("(max-width:767.95px)");

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

  if (isMobile) {
    return (
      <Box display="flex" flexDirection="column" gap={2} p={1}>
        {members.map((member) => {
          const planName =
            mealPlans.find((p) => p.plan_id === member.current_plan_id)?.plan_name ||
            `Plan ID: ${member.current_plan_id}`;
          const joiningDateStr = member.joining_date
            ? new Date(member.joining_date).toLocaleDateString()
            : "-";

          return (
            <Card key={member.member_id} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {member.member_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: #{member.member_id}
                    </Typography>
                  </Box>
                  <Chip
                    label={member.status}
                    color={member.status === "active" ? "success" : "default"}
                    size="small"
                  />
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Grid container spacing={1} sx={{ mb: 1.5 }}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Email
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                      {member.email || "-"}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Phone
                    </Typography>
                    <Typography variant="body2" fontWeight="500">
                      {member.phone}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Meal Plan
                    </Typography>
                    <Typography variant="body2" fontWeight="500">
                      {planName}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Joining Date
                    </Typography>
                    <Typography variant="body2">{joiningDateStr}</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 1 }} />

                <Box display="flex" justifyContent="flex-end" gap={1} pt={0.5}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => onEdit(member)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => onDelete(member.member_id)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
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
