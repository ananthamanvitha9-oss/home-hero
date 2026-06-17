// In-Memory store for notifications
const notifications = [
  {
    id: 'notif_908c17d0-1cfa-42f5-b286',
    recipient_id: 'anonymous_client',
    title: 'Hero Matched!',
    body: 'Marcus has accepted your booking and is en route.',
    is_read: false,
    created_at: new Date()
  }
];

exports.getNotifications = (req, res) => {
  const userId = req.user ? req.user.id : 'anonymous_client';
  const userNotifs = notifications.filter(n => n.recipient_id === userId || n.recipient_id === 'anonymous_client');
  res.json({ success: true, notifications: userNotifs });
};

exports.markAsRead = (req, res) => {
  const { id } = req.params;
  const notification = notifications.find(n => n.id === id);

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found.' });
  }

  notification.is_read = true;
  res.json({
    success: true,
    message: 'Notification marked as read.',
    notification_id: id,
    is_read: true
  });
};
