const SERIAL_WIDTH = 3;
const BRANCH_CODE_WIDTH = 2;
export const STAFF_TYPE_CODES = {
  TEACHING: 'TS',
  SUPPORTING: 'SS',
};

export const normalizeStaffBranchCode = branchCode =>
  String(branchCode || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, BRANCH_CODE_WIDTH);

export const normalizeStaffType = staffType => {
  const normalized = String(staffType || 'TEACHING').trim().toUpperCase();
  return normalized === 'SUPPORTING' ? 'SUPPORTING' : 'TEACHING';
};

export const normalizeJoiningYear = joiningYear =>
  Number(String(joiningYear || new Date().getFullYear()).slice(-2));

export const formatStaffId = ({joiningYear, branchCode, staffType = 'TEACHING', serialNumber}) => {
  const year = String(normalizeJoiningYear(joiningYear)).padStart(2, '0');
  const normalizedBranchCode = normalizeStaffBranchCode(branchCode);
  const staffCode = STAFF_TYPE_CODES[normalizeStaffType(staffType)];
  const serial = String(serialNumber).padStart(SERIAL_WIDTH, '0');

  return `${year}${normalizedBranchCode}${staffCode}${serial}`;
};

export const getNextStaffSerialNumber = lastSerialNumber =>
  Number(lastSerialNumber || 0) + 1;

export const buildStaffIdPayload = ({joiningYear, branchCode, staffType = 'TEACHING', lastSerialNumber}) => {
  const serialNumber = getNextStaffSerialNumber(lastSerialNumber);
  const normalizedJoiningYear = normalizeJoiningYear(joiningYear);
  const normalizedBranchCode = normalizeStaffBranchCode(branchCode);
  const normalizedStaffType = normalizeStaffType(staffType);

  return {
    joiningYear: normalizedJoiningYear,
    branchCode: normalizedBranchCode,
    staffType: normalizedStaffType,
    serialNumber,
    employeeId: formatStaffId({
      joiningYear: normalizedJoiningYear,
      branchCode: normalizedBranchCode,
      staffType: normalizedStaffType,
      serialNumber,
    }),
  };
};
