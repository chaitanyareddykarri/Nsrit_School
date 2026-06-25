import {validateStudentPayload} from '../src/utils/studentValidation';

describe('validateStudentPayload', () => {
  const basePayload = {
    fullName: 'John Doe',
    gender: 'MALE',
    dateOfBirth: '2015-05-15',
    admissionDate: '2026-06-01',
    className: '5',
    branchId: 'branch-uuid-123',
    branchCode: 'B123',
    academicClassId: 'class-uuid-123',
    wingId: 'wing-uuid-123',
    wingCode: 'PRIMARY',
    sectionId: 'section-uuid-123',
    sectionName: 'A',
    admissionYear: '2026',
  };

  it('fails validation if student name is empty', () => {
    const payload = { ...basePayload, fullName: '  ' };
    expect(validateStudentPayload(payload)).toBe('Student name is required');
  });

  it('fails validation if gender is empty', () => {
    const payload = { ...basePayload, gender: '' };
    expect(validateStudentPayload(payload)).toBe('Gender is required');
  });

  it('fails validation if parent mobile is missing or invalid', () => {
    const payload = { ...basePayload };
    expect(validateStudentPayload(payload)).toBe('At least one valid parent or guardian mobile number is required');
  });

  it('passes validation if only father mobile is present and valid', () => {
    const payload = { ...basePayload, fatherMobile: '9876543210' };
    expect(validateStudentPayload(payload)).toBe('');
  });

  it('passes validation if only mother mobile is present and valid', () => {
    const payload = { ...basePayload, motherMobile: '9876543210' };
    expect(validateStudentPayload(payload)).toBe('');
  });

  it('passes validation if only guardian mobile is present and valid', () => {
    const payload = { ...basePayload, guardianMobile: '9876543210' };
    expect(validateStudentPayload(payload)).toBe('');
  });

  it('fails validation if className is not predefined', () => {
    const payload = { ...basePayload, fatherMobile: '9876543210', className: 'InvalidClass' };
    expect(validateStudentPayload(payload)).toBe('Select a valid predefined class');
  });
});
