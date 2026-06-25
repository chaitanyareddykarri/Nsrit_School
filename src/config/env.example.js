import { Platform } from 'react-native';

export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

export const apiConfig = {
  baseURL: '',
  timeout: 15000,
};

export const USE_EMULATOR = false;
export const USE_AUTH_EMULATOR = false;

const EMULATOR_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const dataConnectConfig = {
  projectId: firebaseConfig.projectId || '',
  location: 'asia-south1',
  serviceId: '',
  connectorId: 'nsrit',
  apiBaseURL: USE_EMULATOR
    ? `http://${EMULATOR_HOST}:9399/v1`
    : 'https://firebasedataconnect.googleapis.com/v1',
};
