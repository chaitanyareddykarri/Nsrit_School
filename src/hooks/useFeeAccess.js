import {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {USER_ROLES} from '../config/constants';
import {getMainAdminBranchContext} from '../services/mainAdmin/mainAdminContextService';

export const useFeeAccess = () => {
  const user = useSelector(state => state.auth.user);
  const role = useSelector(state => state.auth.role);

  return useMemo(
    () => {
      const normalizedRole = String(role || user?.role || '').toUpperCase();
      const mainAdminContext = normalizedRole === USER_ROLES.MAIN_ADMIN ? getMainAdminBranchContext() : null;
      return {
      role: role || user?.role,
      branchId: user?.branchId || mainAdminContext?.branchId,
      branchCode: user?.branchCode || mainAdminContext?.branchCode,
      userId: user?.id,
      accountantId: user?.accountantId,
      parentId: user?.parentId || user?.id,
      wingId: user?.wingId,
      wing: user?.wing,
      sectionId: user?.sectionId,
      academicClassId: user?.academicClassId,
      sectionName: user?.sectionName || 'A',
      };
    },
    [role, user],
  );
};

export default useFeeAccess;
