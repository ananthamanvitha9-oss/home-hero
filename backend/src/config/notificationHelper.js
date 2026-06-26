const admin = require('firebase-admin');
const Notification = require('../models/notificationModel');

let fcmInitialized = false;

// Attempt to initialize Firebase Admin SDK
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    fcmInitialized = true;
    console.log('[FCM] Firebase Cloud Messaging successfully initialized.');
  } catch (err) {
    console.error('[FCM] Failed to initialize Firebase Admin SDK:', err.message);
  }
} else {
  console.log('[FCM] Firebase service account JSON missing. Operating in fallback mock mode.');
}

/**
 * Dispatch a notification to a user. Saves to database and sends push via FCM if active.
 * @param {string} recipientId - The ID of the user receiving the alert.
 * @param {string} title - The notification title.
 * @param {string} body - The notification body content.
 * @param {string} [type='push'] - The delivery channel.
 */
const sendPushNotification = async (recipientId, title, body, type = 'push') => {
  try {
    // 1. Persist the notification to MongoDB so the client can query their alerts panel
    const notif = new Notification({
      recipientId,
      title,
      body,
      type,
      isRead: false
    });
    await notif.save();

    console.log(`[Notification Dispatcher] Persisted alert: "${title}" to recipient ${recipientId}`);

    // 2. Dispatch actual push via Firebase Cloud Messaging if initialized
    if (fcmInitialized) {
      const message = {
        notification: { title, body },
        topic: `user_${recipientId}`
      };
      
      const response = await admin.messaging().send(message);
      console.log('[FCM] Push notification successfully sent to device topic:', response);
    } else {
      console.log(`[FCM Mock] Simulated push send for user topic "user_${recipientId}"`);
    }

    return notif;
  } catch (err) {
    console.error('[Notification Dispatcher] Error dispatching alert:', err.message);
    throw err;
  }
};

module.exports = { sendPushNotification };
