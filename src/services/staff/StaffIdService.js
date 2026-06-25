import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import {
  STAFF_TYPE_CODES,
  buildStaffIdPayload,
  normalizeJoiningYear,
  normalizeStaffBranchCode,
  normalizeStaffType,
} from '../../utils/staffIdGenerator';

const currentJoiningYear = () => Number(String(new Date().getFullYear()).slice(-2));
const isMissingOperationError = error =>
  /operation "GetStaffIdsByPrefix" not found|NOT_FOUND/i.test(String(error?.message || error));

const resolveBranchCode = async ({branchId, branchCode}) => {
  if (branchCode) {
    return normalizeStaffBranchCode(branchCode);
  }

  const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_BRANCHES, {
    limit: 1000,
    offset: 0,
  });
  const branch = response.branches?.find(item => item.id === branchId);

  if (!branch?.branchCode) {
    throw new Error('Branch code is required to generate employee ID.');
  }

  return normalizeStaffBranchCode(branch.branchCode);
};

export const StaffIdService = {
  async getNextStaffId({
    branchId,
    branchCode,
    joiningYear = currentJoiningYear(),
    staffType = 'TEACHING',
  }) {
    const resolvedBranchCode = await resolveBranchCode({branchId, branchCode});
    const normalizedJoiningYear = normalizeJoiningYear(joiningYear);
    const normalizedStaffType = normalizeStaffType(staffType);
    const prefix = `${String(normalizedJoiningYear).padStart(2, '0')}${resolvedBranchCode}${STAFF_TYPE_CODES[normalizedStaffType]}`;

    let maxSequence = 0;

    try {
      const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_STAFF_IDS_BY_PREFIX, {
        branchId,
        staffType: normalizedStaffType,
        employeeIdPrefix: prefix,
      });

      maxSequence = (response.users || []).reduce((max, user) => {
        const employeeId = String(user.employeeId || '');
        if (!employeeId.startsWith(prefix)) {
          return max;
        }
        return Math.max(max, Number(employeeId.slice(prefix.length)) || 0);
      }, 0);
    } catch (error) {
      if (!isMissingOperationError(error)) {
        throw error;
      }
      console.log('[StaffId] Live connector is missing GetStaffIdsByPrefix; using fresh-start serial seed.');
    }

    return buildStaffIdPayload({
      joiningYear: normalizedJoiningYear,
      branchCode: resolvedBranchCode,
      staffType: normalizedStaffType,
      lastSerialNumber: maxSequence,
    });
  },
};

export default StaffIdService;
