import auth, {
  getAuth,
  signInWithPhoneNumber,
  signInWithCredential,
  signOut,
  PhoneAuthProvider,
  getIdToken,
  onAuthStateChanged,
} from '@react-native-firebase/auth';
import { Platform } from 'react-native';
import {STORAGE_KEYS} from '../../config/constants';
import {USE_EMULATOR, USE_AUTH_EMULATOR} from '../../config/env';
import logger from '../../utils/logger';

if (__DEV__ && (USE_EMULATOR || USE_AUTH_EMULATOR)) {
  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  try {
    auth().useEmulator(`http://${host}:9099`);
    logger.log(`[Auth] Connected to Firebase Auth Emulator at http://${host}:9099`);
  } catch (e) {
    // useEmulator can only be called once per process — safe to ignore on hot reload
    logger.warn('[Auth] Emulator already configured or error:', e.message);
  }
}

import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import {getJSON, removeStorageKeys, setJSON, storage} from '../storage/mmkvStorage';
import {errorResponse, successResponse} from '../../utils/firebaseResponse';
import {formatE164PhoneNumber} from '../../utils/phone';
import {USER_ROLES, USER_ROLE_PRIORITY} from '../../config/constants';
import parentService from '../parents/parentService';
import teacherService from '../teachers/teacherService';
import {stampUserClaims} from './claimsService';


const buildFullPhoneNumber = ({countryCode = '+91', phoneNumber}) => {
  return formatE164PhoneNumber({countryCode, phoneNumber});
};

const normalizeRole = role => String(role || '').toUpperCase();
const AUTH_STATE_WAIT_MS = 3000;

const waitForCurrentUser = authInstance => {
  if (authInstance.currentUser) {
    return Promise.resolve(authInstance.currentUser);
  }

  return new Promise(resolve => {
    let timeoutId;
    let settled = false;
    let unsubscribe = () => {};

    const finish = user => {
      if (settled) {
        return;
      }
      settled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      unsubscribe();
      resolve(user || authInstance.currentUser || null);
    };

    unsubscribe = onAuthStateChanged(authInstance, finish);
    timeoutId = setTimeout(() => finish(authInstance.currentUser || null), AUTH_STATE_WAIT_MS);
  });
};

const uniqueRoles = roles => {
  const seen = new Set();
  return (roles || [])
    .map(item => normalizeRole(item?.role || item))
    .filter(Boolean)
    .filter(role => {
      if (seen.has(role)) {
        return false;
      }
      seen.add(role);
      return true;
    });
};

// Determines the set of roles available to a user at login.
//
// SOURCE OF TRUTH: user_roles table (userRoles_on_user).
// Roles are managed exclusively through ChangeUserRoleScreen (ChangeUserPrimaryRole
// + AddAdditionalRole mutations), which atomically clears and re-sets the exact
// intended role set. EnsureCurrentUserLegacyRole only upserts — never deletes —
// so multi-role assignments (e.g. TEACHER + PARENT) survive every login.
//
// Fallback: if user_roles is empty, use users.role so accounts created before
// the admin tool existed still work.
const getProfileRoles = profile => {
  const rolesFromTable = (profile?.roles || [])
    .map(item => normalizeRole(item?.role || item))
    .filter(Boolean);

  logger.log(
    '[Auth] getProfileRoles — user_roles rows:', rolesFromTable,
    '| users.role:', profile?.role,
  );

  if (rolesFromTable.length > 0) {
    return uniqueRoles(rolesFromTable);
  }

  // Fallback for accounts not yet touched by ChangeUserRoleScreen.
  const primaryRole = normalizeRole(profile?.role);
  logger.warn('[Auth] getProfileRoles — user_roles empty, fallback to users.role:', primaryRole);
  return primaryRole ? uniqueRoles([primaryRole]) : [];
};

const resolveDefaultRole = roles =>
  USER_ROLE_PRIORITY.find(role => roles.includes(role)) || roles[0] || null;

const resolveActiveRole = (roles, preferredRole) => {
  const preferred = normalizeRole(preferredRole);
  return preferred && roles.includes(preferred) ? preferred : resolveDefaultRole(roles);
};

const normalizeProfile = (profile, fallback = {}) => {
  const user = profile || {};

  return {
    id: user.id,
    uid: user.firebaseUID,
    firebaseUID: user.firebaseUID,
    fullName: user.fullName,
    name: user.fullName,
    countryCode: user.countryCode || fallback.countryCode,
    phoneNumber: user.phoneNumber || fallback.phoneNumber,
    role: user.role,
    roles: uniqueRoles(user.roles || fallback.roles || [user.role]),
    activeRole: user.role,
    primaryRole: user.primaryRole || fallback.primaryRole || user.role,
    employeeId: user.employeeId || fallback.employeeId || null,
    branchId: user.branchId || null,
    branchCode: user.branch?.branchCode || user.branchCode || fallback.branchCode || null,
    branchName: user.branch?.name || user.branchName || fallback.branchName || null,
    wingId: user.wingId || null,
    wing: user.wing || fallback.wing || null,
    coordinatorId: user.coordinatorId || fallback.coordinatorId || null,
    teacherId: user.teacherId || fallback.teacherId || null,
    accountantId: user.accountantId || fallback.accountantId || null,
    sectionId: user.sectionId || null,
    parentId: user.parentId || fallback.parentId || null,
    parentProfileId: user.parentProfileId || fallback.parentProfileId || null,
    academicClassId: user.academicClassId || fallback.academicClassId || null,
    status: user.status || fallback.status || (user.isActive === false ? 'INACTIVE' : 'ACTIVE'),
    isActive: user.isActive ?? true,
  };
};

const fetchUserProfile = async firebaseUID => {
  const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_CURRENT_USER, {
    firebaseUID,
  });
  return response.users?.[0] || null;
};

const fetchUserProfileByPhone = async phoneNumber => {
  // Primary search: exact E.164 format (+919876543210 — what Firebase returns).
  const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_USER_BY_PHONE, {
    phoneNumber,
  });
  if (response.users?.[0]) {
    return response.users[0];
  }

  // Fallback: some accounts were created by admins without the country code prefix
  // (e.g. '9876543210' instead of '+919876543210'). Try the last 10 digits.
  const digits = String(phoneNumber).replace(/\D/g, '');
  const tenDigit = digits.slice(-10);
  if (tenDigit.length === 10 && tenDigit !== phoneNumber) {
    logger.log('[Auth] fetchUserProfileByPhone — retrying with 10-digit format:', tenDigit);
    const response2 = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_USER_BY_PHONE, {
      phoneNumber: tenDigit,
    });
    if (response2.users?.[0]) {
      return response2.users[0];
    }
  }

  return null;
};

const claimUserProfile = async id => {
  await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CLAIM_USER_FIREBASE_UID, {
    id,
  });
};

// Copies users.role → user_roles (idempotent upsert).
// This is a data-migration helper, not role inheritance. It does NOT create new
// roles — it ensures the explicitly-assigned users.role has a matching user_roles
// record so that SwitchRole's @check and multi-role detection work correctly.
const ensureCurrentUserLegacyRole = async () => {
  try {
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.ENSURE_CURRENT_USER_LEGACY_ROLE);
  } catch (error) {
    logger.warn('[Auth] ensureCurrentUserLegacyRole skipped:', error.message);
  }
};

const getFirstBranch = branches => (Array.isArray(branches) ? branches[0] : null);

const applyBranchProfile = (profile, branch) => ({
  ...profile,
  branchId: branch?.id || profile.branchId || null,
  branchCode: branch?.branchCode || profile.branchCode || null,
  branchName: branch?.name || profile.branchName || null,
});

const hydrateRoleProfile = async (profile, preferredRole) => {
  if (!profile) {
    return null;
  }

  const roles = getProfileRoles(profile);
  const role = resolveActiveRole(roles, preferredRole);
  const baseProfile = {
    ...profile,
    primaryRole: normalizeRole(profile.role),
    role,
    roles,
  };

  if (role === USER_ROLES.PRINCIPAL) {
    return applyBranchProfile(baseProfile, getFirstBranch(profile.principalBranches));
  }

  if (role === USER_ROLES.BRANCH_ADMIN) {
    return applyBranchProfile(baseProfile, getFirstBranch(profile.branchAdminBranches));
  }

  if (role === USER_ROLES.COORDINATOR) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_COORDINATOR_BY_USER, {
      userId: profile.id,
    });
    const coordinator = response.coordinators?.[0];
    return {
      ...baseProfile,
      coordinatorId: coordinator?.id || null,
      branchId: coordinator?.branchId || baseProfile.branchId || null,
      wing: coordinator?.wing || null,
    };
  }

  if (role === USER_ROLES.TEACHER || role === USER_ROLES.CLASS_TEACHER) {
    const teacher = await teacherService.getTeacherProfileByUser(profile.id);
    const assignments = teacher?.assignments || teacher?.teacherSectionAssignments_on_teacher || [];
    const classTeacherAssignment = assignments.find(item => item.isClassTeacher && item.isActive !== false);
    const classTeacherSection = classTeacherAssignment?.section;
    return {
      ...baseProfile,
      teacherId: teacher?.id || null,
      branchId: teacher?.branchId || baseProfile.branchId || null,
      sectionId: classTeacherAssignment?.sectionId || null,
      sectionName: classTeacherSection?.name || null,
      academicClassId: classTeacherSection?.academicClass?.id || null,
    };
  }

  if (role === USER_ROLES.ACCOUNTANT) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_ACCOUNTANT_BY_USER, {
      userId: profile.id,
    });
    const accountant = response.accountants?.[0];
    return {
      ...baseProfile,
      accountantId: accountant?.id || null,
      branchId: accountant?.branchId || baseProfile.branchId || null,
      branchCode: accountant?.branch?.branchCode || baseProfile.branchCode || null,
      branchName: accountant?.branch?.name || baseProfile.branchName || null,
    };
  }

  if (role !== USER_ROLES.PARENT) {
    return baseProfile;
  }

  const parent = await parentService.getParentByUser(profile.id);
  return {
    ...baseProfile,
    parentId: profile.id,
    parentProfileId: parent?.id || null,
  };
};

export const authService = {
  async sendOtp({countryCode, phoneNumber}) {
    try {
      const fullPhoneNumber = buildFullPhoneNumber({countryCode, phoneNumber});
      logger.log('[Auth] sendOtp started — phone:', fullPhoneNumber);

      const authInstance = getAuth();
      const confirmation = await signInWithPhoneNumber(authInstance, fullPhoneNumber);
      // L-2 fix: use setJSON (encrypted wrapper) instead of raw storage.set for OTP ID.
      setJSON(STORAGE_KEYS.OTP_VERIFICATION_ID, confirmation.verificationId);

      logger.log('[Auth] OTP sent — verificationId stored in MMKV');
      return successResponse(
        {
          verificationId: confirmation.verificationId,
          fullPhoneNumber,
        },
        'OTP sent successfully',
      );
    } catch (error) {
      logger.error('[Auth] sendOtp failed:', error.code, error.message);
      return errorResponse(error, 'Unable to send OTP');
    }
  },

  async verifyOtp({verificationId, otp, countryCode, phoneNumber}) {
    try {
      logger.log('[Auth] verifyOtp started');

      const authInstance = getAuth();
      const credential = PhoneAuthProvider.credential(verificationId, otp);

      logger.log('[Auth] signInWithCredential — calling Firebase...');
      const result = await signInWithCredential(authInstance, credential);
      const credentialUser = result.user;
      logger.log('[Auth] Firebase sign-in OK — UID:', credentialUser?.uid);

      const token = await getIdToken(credentialUser);
      logger.log('[Auth] ID token obtained');

      const fullPhoneNumber =
        credentialUser.phoneNumber || buildFullPhoneNumber({countryCode, phoneNumber});
      logger.log('[Auth] Full phone number:', fullPhoneNumber);

      // Store token immediately so DataConnect has auth for subsequent queries.
      storage.set(STORAGE_KEYS.AUTH_TOKEN, token);

      // ── Step 1: find profile by Firebase UID ─────────────────────────────
      logger.log('[Auth] fetchUserProfile by UID:', credentialUser.uid);
      let rawProfile = await fetchUserProfile(credentialUser.uid);
      logger.log('[Auth] Profile by UID:', rawProfile ? `found (id=${rawProfile.id})` : 'NOT FOUND');

      if (rawProfile) {
        // Sync users.role → user_roles (idempotent, non-destructive).
        // Required so SwitchRole mutation finds the role in user_roles, and so
        // multi-role detection is accurate for accounts created before user_roles existed.
        await ensureCurrentUserLegacyRole();
        rawProfile = await fetchUserProfile(credentialUser.uid);
        logger.log('[Auth] Profile re-fetched after role sync');
      }

      // ── Step 2: fallback to phone-number lookup (pending/unclaimed accounts) ──
      if (!rawProfile) {
        logger.log('[Auth] Trying phone lookup for:', fullPhoneNumber);
        const pendingProfile = await fetchUserProfileByPhone(fullPhoneNumber);
        logger.log('[Auth] Profile by phone:', pendingProfile ? `found (id=${pendingProfile.id})` : 'NOT FOUND');

        if (pendingProfile) {
          logger.log('[Auth] Claiming profile — id:', pendingProfile.id);
          await claimUserProfile(pendingProfile.id);
          await ensureCurrentUserLegacyRole();
          rawProfile = await fetchUserProfile(credentialUser.uid);
          logger.log('[Auth] Profile after claim:', rawProfile ? `found (id=${rawProfile.id})` : 'STILL NOT FOUND');
        }
      }

      // ── Step 3: block unregistered numbers ───────────────────────────────
      if (!rawProfile) {
        logger.warn('[Auth] No profile found for UID:', credentialUser.uid, 'phone:', fullPhoneNumber);
        await signOut(authInstance);
        // M-2 fix: use a single generic message for both "not registered" and
        // "no roles assigned" so callers cannot enumerate which phone numbers exist.
        throw new Error('Login failed. Please contact your administrator.');
      }

      // ── Step 4: role detection ────────────────────────────────────────────
      // Reads user_roles table first; falls back to legacy users.role column.
      const roles = getProfileRoles(rawProfile);
      logger.log('[Auth] Roles detected:', roles, '(user_roles count:', rawProfile?.roles?.length ?? 0, ', legacy role:', rawProfile?.role, ')');

      if (roles.length === 0) {
        logger.error('[Auth] No roles found — user_roles empty AND users.role missing. userId:', rawProfile.id);
        await signOut(authInstance);
        // M-2 fix: same generic message — do not reveal whether the account exists.
        throw new Error('Login failed. Please contact your administrator.');
      }

      // ── Step 5a: multiple roles → let user pick ───────────────────────────
      if (roles.length > 1) {
        const baseUser = {
          id: rawProfile.id,
          uid: credentialUser.uid,
          firebaseUID: credentialUser.uid,
          fullName: rawProfile.fullName,
          name: rawProfile.fullName,
          phoneNumber: fullPhoneNumber,
          countryCode,
          roles,
          role: null,
          activeRole: null,
        };
        setJSON(STORAGE_KEYS.AUTH_USER, baseUser);
        logger.log('[Auth] Multiple roles detected:', roles, '— showing RoleSelectionScreen');
        return successResponse(
          {token, user: baseUser, needsRoleSelection: true},
          'Please select a role to continue',
        );
      }

      // ── Step 5b: single role → hydrate and complete login ─────────────────
      logger.log('[Auth] Single role:', roles[0], '— hydrating profile...');
      const profile = await hydrateRoleProfile(rawProfile, roles[0]);
      const user = normalizeProfile(profile, {countryCode, phoneNumber: fullPhoneNumber});
      logger.log('[Auth] Login complete — userId:', user.id, 'role:', user.role, 'branchId:', user.branchId);

      setJSON(STORAGE_KEYS.AUTH_USER, user);

      // H-2 fix: stamp { role, branchId } as custom claims so Firebase Storage
      // rules can enforce branch-scoped write access without a DataConnect call.
      await stampUserClaims({role: user.role, branchId: user.branchId});

      return successResponse({user, token, needsRoleSelection: false}, 'Login successful');

    } catch (error) {
      logger.error('[Auth] verifyOtp failed:', error.code || '', error.message);
      return errorResponse(error, 'Unable to verify OTP');
    }
  },

  // Called when a user with multiple roles picks one from RoleSelectionScreen.
  async selectRole(role) {
    const authInstance = getAuth();
    const currentUser = await waitForCurrentUser(authInstance);
    const storedUser = getJSON(STORAGE_KEYS.AUTH_USER);
    const normalizedRole = normalizeRole(role);
    const roles = uniqueRoles(storedUser?.roles || []);

    logger.log('[Auth] selectRole called — role:', normalizedRole, 'available:', roles);

    if (!currentUser) {
      throw new Error('Authentication required. Please sign in again.');
    }

    if (!roles.includes(normalizedRole)) {
      throw new Error('Requested role is not assigned to this account.');
    }

    const token = await getIdToken(currentUser);
    const rawProfile = await fetchUserProfile(currentUser.uid);
    const profile = await hydrateRoleProfile(rawProfile, normalizedRole);

    if (!profile) {
      throw new Error('Unable to load profile for the selected role.');
    }

    const user = normalizeProfile(profile, {
      ...storedUser,
      roles,
      phoneNumber: currentUser.phoneNumber || storedUser?.phoneNumber,
    });

    logger.log('[Auth] selectRole complete — userId:', user.id, 'role:', user.role);
    setJSON(STORAGE_KEYS.AUTH_USER, user);
    if (token) {
      storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
    }
    // H-2 fix: keep custom claims in sync after role selection.
    await stampUserClaims({role: user.role, branchId: user.branchId});
    return {token, user};
  },

  async checkActive() {
    const authInstance = getAuth();
    const currentUser = authInstance.currentUser;
    if (!currentUser) {
      return false;
    }
    try {
      const profile = await fetchUserProfile(currentUser.uid);
      return Boolean(profile);
    } catch {
      return true;
    }
  },

  async logout() {
    logger.log('[Auth] logout');
    const authInstance = getAuth();
    await signOut(authInstance);
    removeStorageKeys([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.AUTH_USER,
      STORAGE_KEYS.OTP_VERIFICATION_ID,
      STORAGE_KEYS.MAIN_ADMIN_BRANCH_CONTEXT,
    ]);
  },

  // Switch User: signs out Firebase but preserves non-auth app preferences.
  async switchUser() {
    logger.log('[Auth] switchUser');
    const authInstance = getAuth();
    await signOut(authInstance);
    removeStorageKeys([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.AUTH_USER,
      STORAGE_KEYS.OTP_VERIFICATION_ID,
    ]);
  },

  async getStoredSession() {
    logger.log('[Auth] getStoredSession started');
    const authInstance = getAuth();
    const currentUser = await waitForCurrentUser(authInstance);
    const storedUser = getJSON(STORAGE_KEYS.AUTH_USER);

    logger.log('[Auth] getStoredSession — Firebase user:', currentUser?.uid || 'none',
      '| storedUser.role:', storedUser?.role || 'none');

    if (currentUser) {
      try {
        const token = await getIdToken(currentUser);

        let rawProfile = await fetchUserProfile(currentUser.uid);
        logger.log('[Auth] getStoredSession — profile by UID:', rawProfile ? `found (id=${rawProfile.id})` : 'NOT FOUND');

        if (rawProfile) {
          // Keep user_roles in sync with the legacy users.role column on every
          // session restore — idempotent, catches accounts that weren't migrated.
          await ensureCurrentUserLegacyRole();
          rawProfile = await fetchUserProfile(currentUser.uid);
        }

        const preferredRole = storedUser?.role || storedUser?.activeRole;
        logger.log('[Auth] getStoredSession — preferredRole:', preferredRole);

        // If there is no stored active role the user was mid-selection (app killed
        // between OTP and role pick). Force a fresh login to re-show the picker.
        if (!preferredRole) {
          logger.warn('[Auth] getStoredSession — no active role in stored session; clearing.');
          removeStorageKeys([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.AUTH_USER]);
          return null;
        }

        const profile = await hydrateRoleProfile(rawProfile, preferredRole);
        if (profile) {
          const user = normalizeProfile(profile, {
            phoneNumber: currentUser.phoneNumber,
            roles: storedUser?.roles,
          });
          logger.log('[Auth] getStoredSession — session restored, role:', user.role);
          setJSON(STORAGE_KEYS.AUTH_USER, user);
          storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
          return {token, user};
        }
      } catch (error) {
        logger.warn('[Auth] getStoredSession — online fetch failed, trying cache:', error.message);
      }
    }

    if (storedUser) {
      logger.warn('[Auth] getStoredSession — no Firebase user; clearing stored session.');
      removeStorageKeys([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.AUTH_USER]);
    }
    return null;
  },

  async switchRole(newRole) {
    const authInstance = getAuth();
    const currentUser = await waitForCurrentUser(authInstance);
    const storedUser = getJSON(STORAGE_KEYS.AUTH_USER);
    const role = normalizeRole(newRole);
    const roles = uniqueRoles(storedUser?.roles || []);

    logger.log('[Auth] switchRole — from:', storedUser?.role, 'to:', role);

    if (!storedUser?.id || !role || !roles.includes(role)) {
      throw new Error('Requested role is not assigned to this user.');
    }
    if (!currentUser) {
      throw new Error('Authentication required. Please sign in again.');
    }

    // Ensure the current users.role is in user_roles before SwitchRole's @check runs.
    // This handles accounts that still only have the legacy column populated.
    await ensureCurrentUserLegacyRole();

    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.SWITCH_ROLE, {
      userId: storedUser.id,
      oldRole: normalizeRole(storedUser.role),
      newRole: role,
    });

    const token = await getIdToken(currentUser);
    const firebaseUID = currentUser.uid;
    const profile = await hydrateRoleProfile(await fetchUserProfile(firebaseUID), role);
    if (!profile) {
      throw new Error('Unable to refresh user profile for role switch.');
    }
    const user = normalizeProfile(profile, {
      ...storedUser,
      roles,
      phoneNumber: currentUser?.phoneNumber || storedUser.phoneNumber,
    });

    logger.log('[Auth] switchRole complete — new role:', user.role);
    setJSON(STORAGE_KEYS.AUTH_USER, user);
    if (token) {
      storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
    }
    // H-2 fix: keep custom claims in sync after role switch.
    await stampUserClaims({role: user.role, branchId: user.branchId});
    return {token, user};
  },
};

export default authService;
