import academicRepository from '../../repositories/academicRepository';
import {STAFF_TYPES} from '../../config/constants';
import {WINGS} from '../../config/academic';
import {assertBranchAccess} from '../academics/academicAccess';
import StaffIdService from '../staff/StaffIdService';
import {formatE164PhoneNumber} from '../../utils/phone';

const validWings = Object.values(WINGS);

const validateCoordinator = payload => {
  if (!payload.fullName?.trim()) {
    return 'Full name is required.';
  }
  if (!payload.phoneNumber?.trim()) {
    return 'Mobile number is required.';
  }
  if (!validWings.includes(payload.wing)) {
    return 'Select a valid wing.';
  }
  return '';
};

export const coordinatorService = {
  async getCoordinators(branchId, scope) {
    assertBranchAccess(scope, branchId);
    return academicRepository.getCoordinators(branchId);
  },

  async getCoordinatorDetails(coordinatorId) {
    return academicRepository.getCoordinatorDetails(coordinatorId);
  },

  async createCoordinator(payload, scope) {
    const branchId = payload.branchId || scope?.branchId;
    assertBranchAccess(scope, branchId);

    const error = validateCoordinator(payload);
    if (error) {
      throw new Error(error);
    }

    const staffId = await StaffIdService.getNextStaffId({
      branchId,
      branchCode: scope?.branchCode,
      staffType: STAFF_TYPES.TEACHING,
    });

    const countryCode = payload.countryCode || '+91';
    const fullPhoneNumber = formatE164PhoneNumber({
      countryCode,
      phoneNumber: payload.phoneNumber,
    });

    const id = await academicRepository.createCoordinator({
      firebaseUID: payload.firebaseUID || `pending:coordinator:${branchId}:${fullPhoneNumber}`,
      fullName: payload.fullName,
      countryCode,
      phoneNumber: fullPhoneNumber,
      email: payload.email || null,
      gender: payload.gender || null,
      employeeId: staffId.employeeId,
      staffType: staffId.staffType,
      joiningYear: staffId.joiningYear,
      branchCode: staffId.branchCode,
      serialNumber: staffId.serialNumber,
      branchId,
      wing: payload.wing,
    });

    return {id, ...payload, ...staffId, branchId, role: 'COORDINATOR', isActive: true};
  },

  async updateCoordinator(payload, scope) {
    assertBranchAccess(scope, payload.branchId || scope?.branchId);

    const error = validateCoordinator(payload);
    if (error) {
      throw new Error(error);
    }

    const countryCode = payload.countryCode || '+91';
    const fullPhoneNumber = formatE164PhoneNumber({
      countryCode,
      phoneNumber: payload.phoneNumber,
    });

    const id = await academicRepository.updateCoordinator({
      ...payload,
      countryCode,
      phoneNumber: fullPhoneNumber,
    });
    return {id, ...payload};
  },
};

export default coordinatorService;
