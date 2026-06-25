export const normalizePhoneNumber = value => String(value || '').replace(/\D/g, '');

export const formatE164PhoneNumber = ({countryCode = '+91', phoneNumber}) => {
  const code = String(countryCode).startsWith('+') ? countryCode : `+${countryCode}`;
  return `${code}${normalizePhoneNumber(phoneNumber)}`;
};

export const getPhoneSearchKey = phoneNumber => normalizePhoneNumber(phoneNumber).slice(-10);
