const Notification = require('../models/notificationModel');

exports.getNotifications = async (req, res) => {
  try {
    const recipientId = req.user.id;
    const notificationsList = await Notification.find({ recipientId }).sort({ createdAt: -1 });
    
    res.json({ success: true, notifications: notificationsList });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find notification and ensure it belongs to the requesting user
    const notification = await Notification.findOne({ _id: id, recipientId: req.user.id });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read.',
      notification_id: id,
      is_read: true
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
