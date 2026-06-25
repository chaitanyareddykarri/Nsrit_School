import {STAFF_TYPES, USER_ROLES} from '../../config/constants';
import {formatE164PhoneNumber, normalizePhoneNumber} from '../../utils/phone';
import {assertBranchAccess} from '../academics/academicAccess';
import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import StaffIdService from '../staff/StaffIdService';
import {toISODate} from '../../utils/helpers/dateHelpers';

const today = () => toISODate();
const normalizeRole = role => String(role || '').toUpperCase();
const buildPendingFirebaseUID = ({branchId, phoneNumber}) =>
  `pending:accountant:${branchId}:${normalizePhoneNumber(phoneNumber)}`;

const flattenAccountant = accountant => ({
  ...accountant,
  fullName: accountant.user?.fullName,
  phoneNumber: accountant.user?.phoneNumber,
  countryCode: accountant.user?.countryCode,
  role: accountant.user?.role,
});

const validateAccountant = payload => {
  if (!payload.fullName?.trim()) {
    return 'Full name is required.';
  }
  if (normalizePhoneNumber(payload.phoneNumber).length < 10) {
    return 'Enter a valid mobile number.';
  }
  if (!payload.gender) {
    return 'Gender is required.';
  }
  if (!payload.joiningDate) {
    return 'Joining date is required.';
  }
  if (!payload.designation?.trim()) {
    return 'Designation is required.';
  }
  return '';
};

const normalizePayload = (payload, scope = {}) => {
  const countryCode = payload.countryCode || '+91';
  return {
    ...payload,
    branchId: payload.branchId || scope.branchId,
    countryCode,
    phoneNumber: formatE164PhoneNumber({countryCode, phoneNumber: payload.phoneNumber}),
    joiningDate: payload.joiningDate || today(),
    fullName: payload.fullName?.trim(),
    designation: payload.designation?.trim(),
  };
};

export const accountantService = {
  async getAccountants(branchId, scope) {
    assertBranchAccess(scope, branchId);
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_ACCOUNTANTS, {
      branchId,
      limit: 100,
      offset: 0,
    });
    return (response.accountants || []).map(flattenAccountant);
  },

  async getAccountantProfile(accountantId) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_ACCOUNTANT_PROFILE, {
      accountantId,
    });
    return response.accountant ? flattenAccountant(response.accountant) : null;
  },

  async createAccountant(payload, scope) {
    if (normalizeRole(scope?.role) !== USER_ROLES.PRINCIPAL) {
      throw new Error('Only principals can create accountants.');
    }

    const normalized = normalizePayload(payload, scope);
    assertBranchAccess(scope, normalized.branchId);
    const error = validateAccountant(normalized);
    if (error) {
      throw new Error(error);
    }

    const existingUser = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_USER_BY_PHONE, {
      phoneNumber: normalized.phoneNumber,
    });
    if (existingUser.users?.length) {
      throw new Error('A user with this phone number already exists.');
    }

    const staffId = await StaffIdService.getNextStaffId({
      branchId: normalized.branchId,
      branchCode: scope.branchCode,
      staffType: STAFF_TYPES.SUPPORTING,
    });

    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_ACCOUNTANT, {
      firebaseUID:
        normalized.firebaseUID ||
        buildPendingFirebaseUID({
          branchId: normalized.branchId,
          phoneNumber: normalized.phoneNumber,
        }),
      fullName: normalized.fullName,
      countryCode: normalized.countryCode,
      phoneNumber: normalized.phoneNumber,
      email: normalized.email || null,
      gender: normalized.gender,
      joiningDate: normalized.joiningDate,
      designation: normalized.designation,
      qualification: normalized.qualification || null,
      experience: normalized.experience || null,
      address: normalized.address || null,
      city: normalized.city || null,
      state: normalized.state || null,
      pincode: normalized.pincode || null,
      emergencyContact: normalized.emergencyContact || null,
      bloodGroup: normalized.bloodGroup || null,
      employeeId: staffId.employeeId,
      staffType: staffId.staffType,
      joiningYear: staffId.joiningYear,
      branchCode: staffId.branchCode,
      serialNumber: staffId.serialNumber,
      branchId: normalized.branchId,
    });

    return {
      id: response.accountant_insert?.id || response.accountant_insert,
      userId: response.user_insert?.id || response.user_insert,
      ...normalized,
      ...staffId,
      role: USER_ROLES.ACCOUNTANT,
      isActive: true,
    };
  },

  async updateAccountant(payload, scope) {
    if (normalizeRole(scope?.role) !== USER_ROLES.PRINCIPAL) {
      throw new Error('Only principals can update accountants.');
    }
    const normalized = normalizePayload(payload, scope);
    assertBranchAccess(scope, normalized.branchId);
    const error = validateAccountant(normalized);
    if (error) {
      throw new Error(error);
    }

    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPDATE_ACCOUNTANT, {
      accountantId: normalized.accountantId || normalized.id,
      userId: normalized.userId,
      branchId: normalized.branchId,
      fullName: normalized.fullName,
      countryCode: normalized.countryCode,
      phoneNumber: normalized.phoneNumber,
      email: normalized.email || null,
      gender: normalized.gender,
      joiningDate: normalized.joiningDate,
      designation: normalized.designation,
      qualification: normalized.qualification || null,
      experience: normalized.experience || null,
      address: normalized.address || null,
      city: normalized.city || null,
      state: normalized.state || null,
      pincode: normalized.pincode || null,
      emergencyContact: normalized.emergencyContact || null,
      bloodGroup: normalized.bloodGroup || null,
      isActive: normalized.isActive ?? true,
    });
    return {id: response.accountant_update?.id || normalized.accountantId || normalized.id, ...normalized};
  },
};

export default accountantService;
