import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import {STORAGE_KEYS, USER_ROLES} from '../../config/constants';
import {getJSON} from '../storage/mmkvStorage';

const normalizeBranchCode = code =>
  String(code || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 2);

const validateBranchPayload = payload => {
  const requiredFields = [
    ['name', 'Branch name is required.'],
    ['address', 'Address is required.'],
    ['city', 'City is required.'],
    ['state', 'State is required.'],
    ['pincode', 'Pincode is required.'],
    ['phone', 'Phone number is required.'],
    ['email', 'Email is required.'],
    ['status', 'Status is required.'],
  ];

  for (const [field, message] of requiredFields) {
    if (!String(payload[field] || '').trim()) {
      return message;
    }
  }

  if (!/^[A-Z0-9]{2}$/.test(payload.branchCode)) {
    return 'Branch code must be two letters or numbers, for example SO, VP, RJ, or KK.';
  }

  return '';
};

export const branchService = {
  async getBranches({limit = 100, offset = 0} = {}) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_BRANCHES, {
      limit,
      offset,
    });
    return response.branches || [];
  },

  async createBranch(payload) {
    const user = getJSON(STORAGE_KEYS.AUTH_USER);
    const role = String(user?.role || '').toUpperCase();

    console.log('[BranchCreate] Access check:', {
      role,
      userId: user?.id,
      requestedCode: payload.branchCode || payload.code,
    });

    if (role !== USER_ROLES.MAIN_ADMIN) {
      throw new Error('Only Main Admin can create branches.');
    }

    const branchCode = normalizeBranchCode(payload.branchCode || payload.code);
    const normalizedPayload = {
      ...payload,
      branchCode,
      status: payload.status || 'ACTIVE',
    };
    const validationError = validateBranchPayload({
      ...normalizedPayload,
      phone: normalizedPayload.phone || normalizedPayload.contactNumber,
    });

    if (validationError) {
      throw new Error(validationError);
    }

    const existingBranches = await this.getBranches({limit: 1000, offset: 0});
    if (existingBranches.some(branch => String(branch.branchCode || '').toUpperCase() === branchCode)) {
      throw new Error(`Branch code ${branchCode} already exists.`);
    }

    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_BRANCH, {
      name: normalizedPayload.name.trim(),
      branchCode,
      address: normalizedPayload.address.trim(),
      city: normalizedPayload.city.trim(),
      state: normalizedPayload.state.trim(),
      pincode: normalizedPayload.pincode.trim(),
      phone: (normalizedPayload.phone || normalizedPayload.contactNumber).trim(),
      email: normalizedPayload.email.trim(),
      status: normalizedPayload.status,
    });

    return {
      id: response.branch_insert?.id || response.branch_insert,
      ...normalizedPayload,
      isActive: normalizedPayload.status === 'ACTIVE',
    };
  },
};

export default branchService;
