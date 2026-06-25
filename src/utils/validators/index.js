export const isRequired = value => Boolean(String(value || '').trim());

export const normalizePhoneDigits = value => String(value || '').replace(/\D/g, '');

export const validatePhoneLogin = ({countryCode, phoneNumber}) => {
  if (!isRequired(countryCode)) {
    return 'Country code is required';
  }

  const digits = normalizePhoneDigits(phoneNumber);

  if (!digits) {
    return 'Phone number is required';
  }

  // India (+91): exactly 10 digits, starting with 6–9 (valid mobile range).
  if (countryCode === '+91' || countryCode === '91') {
    if (digits.length !== 10) {
      return 'Enter a valid 10-digit mobile number';
    }
    if (!/^[6-9]/.test(digits)) {
      return 'Enter a valid Indian mobile number';
    }
    return '';
  }

  // Generic E.164: 7–15 digits (ITU-T recommendation).
  if (digits.length < 7 || digits.length > 15) {
    return 'Enter a valid phone number';
  }

  return '';
};

export const validateOtp = otp => {
  if (!isRequired(otp)) {
    return 'OTP is required';
  }

  if (normalizePhoneDigits(otp).length !== 6) {
    return 'Enter the 6 digit OTP';
  }

  return '';
};

export const validateLogin = validatePhoneLogin;
