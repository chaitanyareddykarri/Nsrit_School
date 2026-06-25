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

  if (digits.length < 10) {
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
