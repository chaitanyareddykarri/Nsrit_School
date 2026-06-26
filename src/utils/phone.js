export const normalizePhoneNumber = value => String(value || '').replace(/\D/g, '');

export const formatE164PhoneNumber = ({countryCode = '+91', phoneNumber}) => {
  const code = String(countryCode).startsWith('+') ? countryCode : `+${countryCode}`;
  const codeDigits = normalizePhoneNumber(code); // e.g. '91'
  let digits = normalizePhoneNumber(phoneNumber);
  // Strip any repeated country code prefix (handles pre-formatted E164 and already-doubled numbers)
  while (digits.startsWith(codeDigits) && digits.length > 10) {
    digits = digits.slice(codeDigits.length);
  }
  return `${code}${digits}`;
};

export const getPhoneSearchKey = phoneNumber => normalizePhoneNumber(phoneNumber).slice(-10);
