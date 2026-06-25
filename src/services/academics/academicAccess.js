import {USER_ROLES} from '../../config/constants';
import {getClassWing} from '../../config/academic';

export const assertBranchAccess = (scope, branchId) => {
  const role = String(scope?.role || '').toUpperCase();
  if (!branchId || !scope?.branchId || scope.branchId !== branchId) {
    if (role !== USER_ROLES.MAIN_ADMIN) {
      throw new Error('You can access only your assigned branch.');
    }
  }
};

export const assertCoordinatorWing = (scope, classNameOrWing) => {
  const role = String(scope?.role || '').toUpperCase();
  if (role !== USER_ROLES.COORDINATOR) {
    return;
  }

  const wing = getClassWing(classNameOrWing) || classNameOrWing;
  if (!scope.wing || wing !== scope.wing) {
    throw new Error('Coordinators can access only students in their assigned wing.');
  }
};

export const canManageBranchAcademics = role =>
  [USER_ROLES.PRINCIPAL, USER_ROLES.BRANCH_ADMIN, USER_ROLES.MAIN_ADMIN].includes(
    String(role || '').toUpperCase(),
  );
