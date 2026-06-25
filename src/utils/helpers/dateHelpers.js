const pad = value => String(value).padStart(2, '0');

export const parseDateString = value => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const text = String(value).trim();
  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
  }

  const displayMatch = text.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (displayMatch) {
    return new Date(Number(displayMatch[3]), Number(displayMatch[2]) - 1, Number(displayMatch[1]));
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const toISODate = date => {
  const value = parseDateString(date) || new Date();
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
};

export const formatDateForDisplay = date => {
  const value = parseDateString(date);
  if (!value) {
    return '';
  }
  return `${pad(value.getDate())}-${pad(value.getMonth() + 1)}-${value.getFullYear()}`;
};

export const formatDisplayDate = formatDateForDisplay;

export const isFutureDate = date => {
  const value = parseDateString(date);
  if (!value) {
    return false;
  }
  const today = parseDateString(toISODate(new Date()));
  return value > today;
};

export const isBeforeDate = (date, comparisonDate) => {
  const value = parseDateString(date);
  const comparison = parseDateString(comparisonDate);
  return Boolean(value && comparison && value < comparison);
};
