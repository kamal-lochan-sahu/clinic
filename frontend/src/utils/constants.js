export const ROLES = { OWNER: "owner", DOCTOR: "doctor", RECEPTIONIST: "receptionist", NURSE: "nurse" };

export const STATUS_COLORS = {
  scheduled: "badge-info",
  confirmed: "badge-success",
  completed: "badge-success",
  cancelled: "badge-danger",
  noshow: "badge-gray",
  waiting: "badge-warning",
  "in-progress": "badge-info",
  paid: "badge-success",
  partial: "badge-warning",
  pending: "badge-danger",
  ordered: "badge-info",
  sample_collected: "badge-warning",
  processing: "badge-warning",
};

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"];
export const GENDERS = ["male", "female", "other"];
export const PAYMENT_MODES = ["cash", "upi", "card", "insurance", "other"];
export const EXPENSE_CATEGORIES = ["rent", "salary", "medicines", "equipment", "maintenance", "other"];
