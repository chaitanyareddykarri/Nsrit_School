export const successResponse = (data, message = 'Request completed successfully') => ({
  success: true,
  message,
  data,
});

export const errorResponse = (error, fallbackMessage = 'Something went wrong') => ({
  success: false,
  message: formatFirebaseError(error, fallbackMessage),
  data: null,
});

export const formatFirebaseError = (error, fallbackMessage = 'Something went wrong') => {
  const code = error?.code || '';
  const message = error?.message || '';

  if (code.includes('invalid-verification-code')) {
    return 'Invalid OTP. Please check the code and try again.';
  }

  if (code.includes('too-many-requests')) {
    return 'Too many OTP attempts. Please wait and try again.';
  }

  if (code.includes('network-request-failed')) {
    return 'Network unavailable. Please check your connection.';
  }

  if (message.includes('not found')) {
    return 'No active user profile found for this phone number.';
  }

  return message || fallbackMessage;
};

export const unwrapResponse = response => {
  if (!response?.success) {
    throw new Error(response?.message || 'Request failed');
  }

  return response.data;
};
