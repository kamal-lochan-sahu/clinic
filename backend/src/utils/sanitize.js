// Fields a client must never be able to set through a request body.
const PROTECTED_FIELDS = ["_id", "ownerId", "createdAt", "updatedAt", "__v"];

// Copy of body without protected fields and without Mongo operators ($set, $unset, ...).
export const stripProtected = (body = {}) => {
  const clean = {};
  for (const [key, value] of Object.entries(body || {})) {
    if (PROTECTED_FIELDS.includes(key) || key.startsWith("$")) continue;
    clean[key] = value;
  }
  return clean;
};

// Escape user input before putting it inside a $regex (prevents regex injection / ReDoS).
export const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Safe pagination numbers from query strings.
export const parsePagination = (page, limit, maxLimit = 100) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(maxLimit, Math.max(1, parseInt(limit, 10) || 20));
  return { pageNum, limitNum };
};
