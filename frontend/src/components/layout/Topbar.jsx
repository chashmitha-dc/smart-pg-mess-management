import { AppBar, Box, IconButton, Stack, Toolbar, Typography, Menu, MenuItem, Avatar, Tooltip } from "@mui/material";
import { Menu as MenuIcon, Logout, Notifications } from "@mui/icons-material";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

function Topbar({ onMenuClick }) {
  const { owner, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleClose();
    navigate("/login");
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton color="inherit" onClick={onMenuClick} sx={{ display: { md: "none" } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={700}>
            Dashboard
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton>
            <Notifications />
          </IconButton>

          <Tooltip title="Account options">
            <Box onClick={handleOpen} sx={{ cursor: "pointer" }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  {owner?.name?.charAt(0) || "U"}
                </Avatar>
                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                  <Typography variant="body2" fontWeight={600}>{owner?.name || "Owner"}</Typography>
                  <Typography variant="caption" color="text.secondary">{owner?.email || ""}</Typography>
                </Box>
              </Stack>
            </Box>
          </Tooltip>

          {/* Always-visible logout icon button */}
          <Tooltip title="Logout">
            <IconButton color="error" onClick={handleLogout} sx={{ ml: 0.5 }}>
              <Logout />
            </IconButton>
          </Tooltip>
        </Stack>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 1 }} fontSize="small" /> Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Topbar;

