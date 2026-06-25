/**
 * Cloud Functions — NSRIT School App
 *
 * setUserClaims: Stamps { role, branchId } as Firebase custom claims by
 * fetching the caller's actual role from DataConnect (Cloud SQL) using admin
 * credentials.  The client NEVER supplies role or branchId — both come from
 * the database so privilege escalation via the callable endpoint is impossible.
 *
 * Deploy: firebase deploy --only functions
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { GoogleAuth } = require('google-auth-library');

admin.initializeApp();

// ── DataConnect config ────────────────────────────────────────────────────────

const PROJECT_ID  = 'nsrit-school-2b749';
const LOCATION    = 'asia-south1';
const SERVICE_ID  = 'nsrit-school-2b749-service';
const CONNECTOR_ID = 'nsrit';

const CONNECTOR_NAME =
  `projects/${PROJECT_ID}/locations/${LOCATION}/services/${SERVICE_ID}/connectors/${CONNECTOR_ID}`;
const DATACONNECT_QUERY_URL =
  `https://firebasedataconnect.googleapis.com/v1/${CONNECTOR_NAME}:executeQuery`;

// Reuse the GoogleAuth client across warm invocations.
let _googleAuthClient;

async function getAdminAccessToken() {
  if (!_googleAuthClient) {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    _googleAuthClient = await auth.getClient();
  }
  const tokenResponse = await _googleAuthClient.getAccessToken();
  return tokenResponse.token;
}

/**
 * Fetches the caller's role and branchId from Cloud SQL via the DataConnect
 * REST API using a service-account OAuth2 token.  The query is marked
 * @auth(level: NO_ACCESS) in the connector, so no client SDK can call it.
 */
async function getUserRoleFromDB(firebaseUID) {
  const accessToken = await getAdminAccessToken();

  const response = await fetch(DATACONNECT_QUERY_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: CONNECTOR_NAME,
      operationName: 'GetUserRoleForClaims',
      variables: { firebaseUID },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new HttpsError('internal', `Role lookup failed (${response.status}): ${body}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new HttpsError('internal', payload.errors[0].message);
  }

  return payload.data?.users?.[0] ?? null;
}

// ── Role allow-list (normalised to UPPER at stamp time) ───────────────────────

const ALLOWED_ROLES = new Set([
  'MAIN_ADMIN',
  'BRANCH_ADMIN',
  'PRINCIPAL',
  'COORDINATOR',
  'TEACHER',
  'CLASS_TEACHER',
  'ACCOUNTANT',
  'PARENT',
]);

// ── Cloud Function ────────────────────────────────────────────────────────────

/**
 * setUserClaims — stamps { role, branchId } onto the caller's Firebase token.
 *
 * Security model:
 *   - Caller must be authenticated (enforced by Firebase).
 *   - App Check is enforced (blocks calls from non-app clients / emulators).
 *   - role and branchId come ONLY from the DataConnect database — the client
 *     sends no role data.  This eliminates the privilege-escalation vector
 *     where a client could self-assign a higher role.
 */
exports.setUserClaims = onCall({ enforceAppCheck: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }

  const uid = request.auth.uid;

  // Server-side verification: fetch the user's actual role from the database.
  const dbUser = await getUserRoleFromDB(uid);

  if (!dbUser || dbUser.isActive === false) {
    throw new HttpsError('not-found', 'User profile not found or inactive.');
  }

  const role = String(dbUser.role ?? '').toUpperCase();

  if (!ALLOWED_ROLES.has(role)) {
    throw new HttpsError('invalid-argument', `Unknown role: ${role}`);
  }

  const claims = { role };
  if (dbUser.branchId) {
    claims.branchId = dbUser.branchId;
  }

  await admin.auth().setCustomUserClaims(uid, claims);

  // The client must force-refresh its ID token to pick up the new claims.
  return { success: true };
});
