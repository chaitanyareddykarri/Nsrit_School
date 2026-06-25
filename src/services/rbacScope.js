import {USER_ROLES} from '../config/constants';

export const getAccessScope = user => {
  // Support teachers assigned to multiple sections (sectionIds array) with single-section fallback
  const sectionIds = user?.sectionIds?.length
    ? user.sectionIds
    : user?.sectionId
    ? [user.sectionId]
    : [];
  return {
    userId: user?.id,
    firebaseUID: user?.firebaseUID || user?.uid,
    role: user?.role,
    branchId: user?.branchId,
    branchCode: user?.branchCode,
    wingId: user?.wingId,
    wing: user?.wing,
    teacherId: user?.teacherId,
    sectionId: user?.sectionId,
    sectionIds,
    parentId: user?.parentId || (user?.role === USER_ROLES.PARENT ? user?.id : null),
  };
};

export const applyRoleFilter = (items, scope) => {
  const role = String(scope?.role || '').toUpperCase();

  if (!role || role === USER_ROLES.MAIN_ADMIN) {
    return items;
  }

  if (role === USER_ROLES.BRANCH_ADMIN || role === USER_ROLES.PRINCIPAL) {
    return items.filter(item => !item.branchId || item.branchId === scope.branchId);
  }

  if (role === USER_ROLES.COORDINATOR) {
    return items.filter(item => {
      const itemWing = item.wing || item.academicClass?.wing?.code;
      return (
        (!item.wingId || item.wingId === scope.wingId) &&
        (!itemWing || itemWing === scope.wing)
      );
    });
  }

  if (role === USER_ROLES.TEACHER || role === USER_ROLES.CLASS_TEACHER) {
    const allowed = scope.sectionIds?.length ? scope.sectionIds : (scope.sectionId ? [scope.sectionId] : []);
    return items.filter(item => !item.sectionId || allowed.includes(item.sectionId));
  }

  if (role === USER_ROLES.PARENT) {
    return items.filter(item => !item.parentId || item.parentId === scope.parentId);
  }

  return items;
};
