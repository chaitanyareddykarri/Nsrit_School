import functions from '@react-native-firebase/functions';
import { getAuth, getIdToken } from '@react-native-firebase/auth';
import { storage } from '../storage/mmkvStorage';
import { STORAGE_KEYS } from '../../config/constants';
import logger from '../../utils/logger';

/**
 * Stamps { role, branchId } as Firebase custom claims on the caller's token.
 *
 * The Cloud Function resolves role and branchId directly from the database
 * using service-account credentials — the client sends no role data.  This
 * closes the privilege-escalation vector where a caller could self-assign a
 * higher role by passing arbitrary values.
 *
 * The returned token is a fresh ID token that already contains the new claims
 * (force-refreshed after the Cloud Function sets them).
 */
export const stampUserClaims = async () => {
  try {
    const fn = functions();
    await fn.httpsCallable('setUserClaims')({});

    // Force-refresh so the new claims are reflected in subsequent requests.
    const authInstance = getAuth();
    const freshToken = await getIdToken(authInstance.currentUser, true);
    storage.set(STORAGE_KEYS.AUTH_TOKEN, freshToken);

    logger.log('[Claims] Custom claims stamped successfully');
    return freshToken;
  } catch (error) {
    // Non-fatal: Storage rules will fall back to Cloud Function-gated paths.
    logger.warn('[Claims] stampUserClaims failed (non-fatal):', error.message);
    return null;
  }
};
