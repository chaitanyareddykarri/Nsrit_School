import {STUDENT_CSV_TEMPLATE, parseCsv} from '../../utils/csvParser';
import {normalizePhoneNumber} from '../../utils/phone';
import {validateStudentPayload} from '../../utils/studentValidation';
import studentService from '../students/studentService';

const mapCsvRowToStudent = (row, defaults) => ({
  branchId: defaults.branchId,
  wingId: defaults.wingId,
  academicClassId: defaults.academicClassId,
  sectionId: defaults.sectionId,
  branchCode: defaults.branchCode,
  fullName: row['Student Name'],
  gender: row.Gender,
  parentName: row['Parent Name'],
  parentPhoneNumber: row['Parent Phone'],
  alternateNumber: row['Alternate Number'],
  className: row.Class,
  sectionName: row.Section,
  admissionYear: Number(row['Admission Year']),
  dateOfBirth: row.DOB,
  address: row.Address,
  admissionDate: row['Admission Date'],
  phoneNumber: row['Parent Phone'],
  countryCode: '+91',
});

export const uploadService = {
  getStudentTemplate() {
    return STUDENT_CSV_TEMPLATE;
  },

  validateRows(rows) {
    const seenPhones = new Set();

    return rows.map(row => {
      const phoneKey = normalizePhoneNumber(row.parentPhoneNumber);
      const validationError = validateStudentPayload(row);
      const duplicateError = seenPhones.has(phoneKey)
        ? 'Duplicate parent phone in CSV'
        : '';

      if (phoneKey) {
        seenPhones.add(phoneKey);
      }

      return {
        row,
        valid: !validationError && !duplicateError,
        error: validationError || duplicateError,
      };
    });
  },

  async uploadStudentsCsv(csvText, defaults, onProgress) {
    const rows = parseCsv(csvText).map(row => mapCsvRowToStudent(row, defaults));
    const validations = this.validateRows(rows);
    const validRows = validations.filter(item => item.valid).map(item => item.row);
    const skippedRows = validations.filter(item => !item.valid);
    const created = [];
    const failed = [];

    for (let index = 0; index < validRows.length; index += 1) {
      const row = validRows[index];
      try {
        const student = await studentService.createStudent(row);
        created.push(student);
      } catch (error) {
        failed.push({row, error: error.message});
      }

      if (onProgress) {
        onProgress({
          completed: index + 1,
          total: validRows.length,
        });
      }
    }

    return {
      success: failed.length === 0,
      message: `${created.length} students uploaded, ${skippedRows.length + failed.length} skipped`,
      data: {
        created,
        skipped: skippedRows,
        failed,
      },
    };
  },
};

export default uploadService;
