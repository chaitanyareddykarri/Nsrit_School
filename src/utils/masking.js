/**
 * H-1 security fix: Aadhaar numbers are regulated PII under the Aadhaar Act 2016
 * and India's DPDP Act 2023.  This module provides display-safe masking so the
 * full 12-digit number is NEVER rendered in the UI.
 *
 * Server-side note: the database stores the plain value.  A future migration
 * should encrypt this column at rest using a KMS-managed key (e.g., Google
 * Cloud KMS via a Cloud Function before insert/update).  Until that migration
 * is complete, this client-side masking is the first line of defence.
 */

/**
 * Masks an Aadhaar number, showing only the last 4 digits.
 * Returns an empty string if the input is blank.
 *
 * Examples:
 *   maskAadhaar('123456789012') → 'XXXX XXXX 9012'
 *   maskAadhaar('1234 5678 9012') → 'XXXX XXXX 9012'
 *   maskAadhaar(null) → ''
 */
export const maskAadhaar = value => {
  if (!value) {
    return '';
  }
  const digits = String(value).replace(/\D/g, '');
  if (digits.length !== 12) {
    return 'XXXX XXXX XXXX';
  }
  return `XXXX XXXX ${digits.slice(8)}`;
};

/**
 * Validates Aadhaar format without exposing the value in logs.
 * Returns true if the string is exactly 12 digits.
 */
export const isValidAadhaarFormat = value => {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length === 12;
};
