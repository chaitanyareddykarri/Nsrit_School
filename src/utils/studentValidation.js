import {isValidPredefinedClass} from '../config/academic';
import {normalizePhoneNumber} from './phone';

export const validateStudentPayload = payload => {
  if (!payload.fullName?.trim()) {
    return 'Student name is required';
  }

  if (!payload.gender?.trim()) {
    return 'Gender is required';
  }

  if (!payload.dateOfBirth) {
    return 'Date of birth is required';
  }

  if (!payload.admissionDate) {
    return 'Admission date is required';
  }

  const parentPhones = [
    payload.fatherMobile,
    payload.fatherPhoneNumber,
    payload.motherMobile,
    payload.motherPhoneNumber,
    payload.guardianMobile,
    payload.guardianPhoneNumber,
    payload.parentPhoneNumber,
    payload.phoneNumber,
  ].filter(Boolean);

  if (!parentPhones.some(phone => normalizePhoneNumber(phone).length >= 10)) {
    return 'At least one valid parent or guardian mobile number is required';
  }

  if (!isValidPredefinedClass(payload.className)) {
    return 'Select a valid predefined class';
  }

  if (!payload.branchId) {
    return 'Branch is required';
  }

  if (!payload.branchCode) {
    return 'Branch code is required';
  }

  if (!payload.academicClassId) {
    return 'Class ID is required';
  }

  if (!payload.wingId || !payload.wingCode) {
    return 'Class wing is required. Please reselect the class.';
  }

  if (!payload.sectionId && !payload.sectionName) {
    return 'Section is required';
  }

  if (!payload.admissionYear) {
    return 'Admission year is required';
  }

  return '';
};
