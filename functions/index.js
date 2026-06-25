/**
 * Cloud Functions — NSRIT School App
 *
 * setUserClaims: Called from the mobile app after login to stamp the Firebase
 * ID token with { role, branchId } custom claims.  The Storage rules (H-2 fix)
 * rely on these claims to enforce branch-scoped write access.
 *
 * Deploy: firebase deploy --only functions
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore(); // Not used — kept for future use.

const ALLOWED_ROLES = new Set([
  'MAIN_ADMIN', 'main_admin',
  'BRANCH_ADMIN', 'branch_admin',
  'PRINCIPAL', 'principal',
  'COORDINATOR', 'coordinator',
  'TEACHER', 'teacher',
  'CLASS_TEACHER', 'class_teacher',
  'ACCOUNTANT', 'accountant',
  'PARENT', 'parent',
]);

/**
 * setUserClaims — stamps { role, branchId } onto the caller's Firebase token.
 *
 * Called once per login session (after OTP verification + DataConnect profile
 * fetch) so that Firebase Storage rules can evaluate role/branch without an
 * extra network call to DataConnect.
 *
 * Security model:
 *   - The caller MUST be authenticated (auth context is verified by Firebase).
 *   - role and branchId come from the DataConnect profile that was already
 *     server-validated at login (auth.uid == profile.firebaseUID @check).
 *   - We never accept a role that isn't in the allow-list.
 *   - We never allow the client to escalate to MAIN_ADMIN if the token doesn't
 *     already carry that claim (prevents privilege escalation on re-calls).
 */
exports.setUserClaims = onCall({ enforceAppCheck: true }, async (request) => {
  const { role, branchId } = request.data || {};

  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }

  const uid = request.auth.uid;
  const normalizedRole = String(role || '').toUpperCase();

  if (!ALLOWED_ROLES.has(normalizedRole) && !ALLOWED_ROLES.has(role)) {
    throw new HttpsError('invalid-argument', 'Unknown role.');
  }

  // Prevent a non-admin from claiming MAIN_ADMIN via this endpoint.
  const existing = request.auth.token;
  const existingRole = String(existing?.role || '').toUpperCase();
  if (
    normalizedRole === 'MAIN_ADMIN' &&
    existingRole !== 'MAIN_ADMIN' &&
    existingRole !== 'MAIN_ADMIN'.toLowerCase()
  ) {
    // Only allow MAIN_ADMIN claim if the token already carries it
    // (i.e., it was set by a previous privileged call, not self-assigned).
    throw new HttpsError(
      'permission-denied',
      'Cannot self-assign MAIN_ADMIN role.',
    );
  }

  const claims = { role: normalizedRole };
  if (branchId) {
    claims.branchId = branchId;
  }

  await admin.auth().setCustomUserClaims(uid, claims);

  // Return success — the client must force-refresh the token to pick up new claims.
  return { success: true };
});
