import {USER_ROLES} from '../config/constants';

export const DESIGNATION_ROLE_MAP = {
  // Teaching Staff
  'Teacher': USER_ROLES.TEACHER,
  'Class Teacher': USER_ROLES.CLASS_TEACHER,
  'Coordinator': USER_ROLES.COORDINATOR,
  'Principal': USER_ROLES.PRINCIPAL,

  // Supporting Staff
  'Computer Operator': USER_ROLES.COMPUTER_OPERATOR,
  'Accountant': USER_ROLES.ACCOUNTANT,
  'Office Assistant': 'SUPPORT_STAFF',
  'Receptionist': 'SUPPORT_STAFF',
  'Librarian': 'SUPPORT_STAFF',
  'Lab Assistant': 'SUPPORT_STAFF',
  'Clerk': 'SUPPORT_STAFF',
  'Attender': 'SUPPORT_STAFF',
  'Security': 'SUPPORT_STAFF',
  'Driver': 'SUPPORT_STAFF',
  'Cleaner': 'SUPPORT_STAFF',
  'Other': 'SUPPORT_STAFF',
};

export const SUPPORTING_STAFF_DESIGNATIONS = [
  'Computer Operator',
  'Accountant',
  'Office Assistant',
  'Receptionist',
  'Librarian',
  'Lab Assistant',
  'Clerk',
  'Attender',
  'Security',
  'Driver',
  'Cleaner',
  'Other',
];

export const TEACHING_STAFF_DESIGNATIONS = [
  'Teacher',
  'Class Teacher',
  'Coordinator',
  'Principal',
];

export const mapDesignationToRole = (designation) => {
  if (!designation) return USER_ROLES.TEACHER;
  // Match case-insensitively just in case
  const match = Object.keys(DESIGNATION_ROLE_MAP).find(
    (key) => key.toLowerCase() === designation.trim().toLowerCase()
  );
  return match ? DESIGNATION_ROLE_MAP[match] : 'SUPPORT_STAFF';
};
