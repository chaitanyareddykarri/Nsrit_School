import functions from '@react-native-firebase/functions';
import { getAuth, getIdToken } from '@react-native-firebase/auth';
import { storage } from '../storage/mmkvStorage';
import { STORAGE_KEYS } from '../../config/constants';
import logger from '../../utils/logger';

/**
 * Stamps { role, branchId } as Firebase custom claims on the caller's token.
 *
 * Storage rules (H-2 fix) rely on these claims to enforce branch-scoped write
 * access without a DataConnect round-trip.  Must be called after every login
 * and role-switch so the claims stay in sync with the DataConnect profile.
 *
 * The returned token is a fresh ID token that already contains the new claims
 * (force-refreshed after the Cloud Function sets them).
 */
export const stampUserClaims = async ({ role, branchId }) => {
  try {
    const fn = functions();
    await fn.httpsCallable('setUserClaims')({ role, branchId: branchId || null });

    // Force-refresh the token so new claims are reflected immediately.
    const authInstance = getAuth();
    const freshToken = await getIdToken(authInstance.currentUser, true);
    storage.set(STORAGE_KEYS.AUTH_TOKEN, freshToken);

    logger.log('[Claims] Custom claims stamped — role:', role, 'branchId:', branchId);
    return freshToken;
  } catch (error) {
    // Non-fatal: Storage writes will fall back to Cloud Function-gated paths.
    logger.warn('[Claims] stampUserClaims failed (non-fatal):', error.message);
    return null;
  }
};
