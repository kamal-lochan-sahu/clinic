export const formatCurrency = (amount, currency = "INR") => {
  if (amount === undefined || amount === null) return "-";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount);
};
