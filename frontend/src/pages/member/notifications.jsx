import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckIcon from "@mui/icons-material/Check";
import toast from "react-hot-toast";

import { getNotifications, updateNotification } from "../../api/notificationApi";

function MemberNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await getNotifications();
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await updateNotification(id, { is_read: true });
      toast.success("Notification marked as read");
      loadNotifications();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update notification");
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={2} sx={{ maxWidth: 800, mx: "auto" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center">
          <NotificationsIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" fontWeight="bold">
            Announcements
          </Typography>
        </Box>
        {unreadCount > 0 && (
          <Chip
            label={`${unreadCount} UNREAD`}
            color="error"
            fontWeight="bold"
            sx={{ borderRadius: 1.5 }}
          />
        )}
      </Box>

      <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
        {notifications.length === 0 ? (
          <Typography color="text.secondary" align="center" py={5}>
            No announcements broadcasted yet.
          </Typography>
        ) : (
          <List>
            {notifications.map((notif, index) => (
              <Box key={notif.notification_id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    py: 2.5,
                    bgcolor: notif.is_read ? "transparent" : "#f0f9ff",
                    borderRadius: 1,
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Typography fontWeight="bold" variant="subtitle1">
                          {notif.title}
                        </Typography>
                        {!notif.is_read && (
                          <Chip label="NEW" size="small" color="error" sx={{ height: 18, fontSize: 10 }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box mt={1}>
                        <Typography variant="body2" color="text.primary" mb={1}>
                          {notif.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Sent: {new Date(notif.created_at).toLocaleString()} • Type: {notif.type.toUpperCase()}
                        </Typography>
                      </Box>
                    }
                  />
                  {!notif.is_read && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<CheckIcon />}
                      onClick={() => handleMarkAsRead(notif.notification_id)}
                      sx={{ ml: 2 }}
                    >
                      Mark read
                    </Button>
                  )}
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}

export default MemberNotifications;
