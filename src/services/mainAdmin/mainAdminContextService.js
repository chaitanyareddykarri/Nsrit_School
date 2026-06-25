import {STORAGE_KEYS, USER_ROLES} from '../../config/constants';
import {getJSON, removeStorageKeys, setJSON} from '../storage/mmkvStorage';

export const buildMainAdminBranchContext = branch => ({
  branchId: branch?.id || branch?.branchId,
  branchCode: branch?.branchCode || branch?.code || null,
  branchName: branch?.name || branch?.branchName || null,
  selectedAt: new Date().toISOString(),
});

export const applyBranchContextToUser = (user, context) => {
  if (String(user?.role || '').toUpperCase() !== USER_ROLES.MAIN_ADMIN || !context?.branchId) {
    return user;
  }

  return {
    ...user,
    branchId: context.branchId,
    branchCode: context.branchCode,
    branchName: context.branchName,
    wingId: null,
    wing: null,
    mainAdminBranchContext: context,
  };
};

export const saveMainAdminBranchContext = context => {
  setJSON(STORAGE_KEYS.MAIN_ADMIN_BRANCH_CONTEXT, context);
  return context;
};

export const getMainAdminBranchContext = () =>
  getJSON(STORAGE_KEYS.MAIN_ADMIN_BRANCH_CONTEXT);

export const clearMainAdminBranchContext = () => {
  removeStorageKeys([STORAGE_KEYS.MAIN_ADMIN_BRANCH_CONTEXT]);
};
