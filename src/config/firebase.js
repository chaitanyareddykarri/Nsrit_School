import {initializeApp, getApps} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {firebaseConfig} from './env';

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
);

const firebaseApp = hasFirebaseConfig
  ? getApps().length
    ? getApps()[0]
    : initializeApp(firebaseConfig)
  : null;

export const firebaseWebAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const isFirebaseConfigured = hasFirebaseConfig;

export default firebaseApp;
