const SERIAL_WIDTH = 4;
const BRANCH_CODE_WIDTH = 2;

export const normalizeBranchCode = branchCode =>
  String(branchCode || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, BRANCH_CODE_WIDTH);

export const normalizeAdmissionYear = admissionYear =>
  Number(String(admissionYear || new Date().getFullYear()).slice(-2));

export const formatStudentId = ({admissionYear, branchCode, serialNumber}) => {
  const year = String(normalizeAdmissionYear(admissionYear)).padStart(2, '0');
  const normalizedBranchCode = normalizeBranchCode(branchCode);
  const serial = String(serialNumber).padStart(SERIAL_WIDTH, '0');

  return `${year}${normalizedBranchCode}${serial}`;
};

export const parseStudentId = studentId => ({
  admissionYear: Number(String(studentId).slice(0, 2)),
  branchCode: String(studentId).slice(2, 4),
  serialNumber: Number(String(studentId).slice(4, 8)),
});

export const getNextSerialNumber = lastSerialNumber => Number(lastSerialNumber || 0) + 1;

export const buildStudentIdPayload = ({admissionYear, branchCode, lastSerialNumber}) => {
  const serialNumber = getNextSerialNumber(lastSerialNumber);

  return {
    admissionYear: Number(admissionYear),
    branchCode: normalizeBranchCode(branchCode),
    serialNumber,
    studentId: formatStudentId({admissionYear, branchCode, serialNumber}),
  };
};
