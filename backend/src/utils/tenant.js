import User from "../models/User.js";
import Staff from "../models/Staff.js";

// The clinic (tenant) a user belongs to: owners are their own clinic, staff point to their owner.
// Staff created before ownerId existed are linked lazily through the Staff collection.
export const resolveClinicId = async (user) => {
  if (user.role === "owner") return user._id;
  if (user.ownerId) return user.ownerId;
  const staff = await Staff.findOne({ userId: user._id }).select("ownerId").lean();
  if (!staff) return null;
  await User.updateOne({ _id: user._id }, { ownerId: staff.ownerId });
  return staff.ownerId;
};

// Branding (white-label) always comes from the clinic owner.
export const resolveBranding = async (user, clinicId) => {
  if (user.role === "owner") return user.branding;
  const owner = await User.findById(clinicId).select("branding").lean();
  return owner?.branding || user.branding;
};
