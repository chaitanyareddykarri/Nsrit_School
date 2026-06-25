# Firebase Cloud Messaging (FCM) Setup Guide

This guide walks through enabling push notifications for NSRIT Connect so that
parents receive foreground and background alerts when a student is marked absent.

---

## Prerequisites

- Firebase project already exists (used for Auth + DataConnect)
- `@react-native-firebase/app` and `@react-native-firebase/auth` already installed (v24)

---

## Step 1 — Install the Messaging Module

```bash
npm install @react-native-firebase/messaging
cd android && ./gradlew clean
```

---

## Step 2 — Android Configuration

The `google-services.json` is already placed in `android/app/`. FCM is included in it automatically when Cloud Messaging is enabled in the Firebase console.

### Enable Cloud Messaging in Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com) → your project
2. Go to **Project Settings → Cloud Messaging**
3. Ensure the **Cloud Messaging API (V1)** is enabled (the legacy API was deprecated)

### android/build.gradle — already present:
```groovy
classpath 'com.google.gms:google-services:4.4.2'
```

### android/app/build.gradle — already present:
```groovy
apply plugin: 'com.google.gms.google-services'
```

---

## Step 3 — iOS Configuration (if needed)

```bash
cd ios && pod install
```

Add push notification capability in Xcode:
- Target → Signing & Capabilities → `+ Capability` → Push Notifications
- Also add Background Modes → Remote Notifications

Upload APNs key or certificate in Firebase Console → Project Settings → Cloud Messaging → iOS app.

---

## Step 4 — Create FCM Token Service

Create `src/services/notifications/fcmService.js`:

```js
import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';

export const fcmService = {
  async requestPermission() {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    const authStatus = await messaging().requestPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  },

  async getToken() {
    return messaging().getToken();
  },

  onTokenRefresh(callback) {
    return messaging().onTokenRefresh(callback);
  },

  // Foreground messages
  onMessage(callback) {
    return messaging().onMessage(callback);
  },

  // Background / quit state tap handler
  setBackgroundMessageHandler() {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('[FCM] Background message:', remoteMessage);
    });
  },
};
```

---

## Step 5 — Store FCM Token in DataConnect

Add a `fcmToken` column to the `User` table in `schema.gql`:

```graphql
type User @table(name: "users", key: "id") {
  ...existing fields...
  fcmToken: String @col(name: "fcm_token", dataType: "varchar(300)")
}
```

Add a mutation in `mutations.gql`:

```graphql
mutation UpdateFcmToken($userId: UUID!, $fcmToken: String!) @auth(level: USER) {
  user_update(id: $userId, data: { fcmToken: $fcmToken })
}
```

---

## Step 6 — Register Token After Login

In `src/store/slices/authSlice.js`, inside the `verifyOtp` thunk after user is loaded:

```js
import { fcmService } from '../../services/notifications/fcmService';

// After successful login:
const hasPermission = await fcmService.requestPermission();
if (hasPermission) {
  const token = await fcmService.getToken();
  if (token) {
    await dataConnectClient.mutate('UpdateFcmToken', { userId: user.id, fcmToken: token });
  }
}
```

---

## Step 7 — Send Push from Attendance Save (Server Side)

The current implementation creates **in-app** `Notification` records for absent students.
To also send a **push notification**, you need a server-side trigger — Firebase Cloud Functions
is the recommended approach.

### Option A: Firebase Cloud Functions (Recommended)

Create `functions/index.js`:

```js
const functions = require('firebase-functions/v2');
const admin = require('firebase-admin');
admin.initializeApp();

// Triggered via HTTP call from the app after attendance save
exports.sendAbsenceNotification = functions.https.onCall(async (request) => {
  const { fcmToken, studentName, date, className } = request.data;
  if (!fcmToken) return { success: false, reason: 'no_token' };

  await admin.messaging().send({
    token: fcmToken,
    notification: {
      title: 'Attendance Alert',
      body: `${studentName} was marked absent on ${date} (Class ${className}).`,
    },
    android: {
      priority: 'high',
      notification: { channelId: 'attendance_alerts', sound: 'default' },
    },
    apns: {
      payload: { aps: { sound: 'default', badge: 1 } },
    },
  });

  return { success: true };
});
```

Deploy:
```bash
firebase deploy --only functions
```

### Option B: Direct REST (quick test)

From server or Cloud Function:
```bash
curl -X POST https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{ "message": { "token": "DEVICE_FCM_TOKEN", "notification": { "title": "Attendance Alert", "body": "..." } } }'
```

---

## Step 8 — Foreground Notification Handler

In `App.jsx` (inside the root component):

```js
import { fcmService } from './src/services/notifications/fcmService';
import Toast from 'react-native-toast-message';

useEffect(() => {
  fcmService.setBackgroundMessageHandler();
  const unsubscribe = fcmService.onMessage(remoteMessage => {
    Toast.show({
      type: 'info',
      text1: remoteMessage.notification?.title,
      text2: remoteMessage.notification?.body,
      visibilityTime: 5000,
    });
  });
  return unsubscribe;
}, []);
```

---

## Step 9 — Android Notification Channel

In `android/app/src/main/res/values/strings.xml`, ensure:
```xml
<string name="default_notification_channel_id">attendance_alerts</string>
```

In `MainActivity.kt` or via `@react-native-firebase/messaging` auto-setup, create the channel:
```kotlin
// onCreate
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
  val channel = NotificationChannel(
    "attendance_alerts", "Attendance Alerts", NotificationManager.IMPORTANCE_HIGH
  )
  val notificationManager = getSystemService(NotificationManager::class.java)
  notificationManager.createNotificationChannel(channel)
}
```

---

## Current Status

| Feature | Status |
|---|---|
| In-app Notification records (DataConnect) | ✅ Implemented |
| Notification Center screen (Parent portal) | ✅ Implemented |
| Mark as read / Mark all read | ✅ Implemented |
| Absence notification on attendance save | ✅ Implemented |
| FCM token registration | ⬜ Needs implementation (steps above) |
| Push notification on absence | ⬜ Needs Cloud Functions |
| Foreground notification handler | ⬜ Needs fcmService wiring |
| iOS APNs | ⬜ Needs certificate upload |

---

## Estimated Implementation Time

- FCM token registration + storage: ~2 hours
- Cloud Functions for push: ~3 hours
- iOS APNs setup: ~1 hour
- Total: ~6 hours for full push notification support
