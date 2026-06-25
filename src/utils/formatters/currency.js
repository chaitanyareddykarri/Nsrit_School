export const formatCurrency = value =>
  `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
