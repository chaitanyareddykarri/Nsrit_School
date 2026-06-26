import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid, Platform} from 'react-native';

export const fcmService = {
  async requestPermission() {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true; // Android < 13 doesn't need runtime permission
      }
      const authStatus = await messaging().requestPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    } catch (error) {
      console.log('[FCM] requestPermission failed:', error.message);
      return false;
    }
  },

  async getToken() {
    try {
      return await messaging().getToken();
    } catch (error) {
      console.log('[FCM] getToken failed:', error.message);
      return null;
    }
  },

  onTokenRefresh(callback) {
    return messaging().onTokenRefresh(callback);
  },

  onMessage(callback) {
    return messaging().onMessage(callback);
  },

  setBackgroundMessageHandler() {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('[FCM] Background message:', remoteMessage);
    });
  },
};

export default fcmService;
