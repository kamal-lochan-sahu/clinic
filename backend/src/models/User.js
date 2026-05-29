import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  role: { type: String, enum: ["owner", "doctor", "receptionist", "nurse"], default: "owner" },
  specialization: { type: String, default: "" },
  qualifications: [{ type: String }],
  branding: {
    clinicName: { type: String, default: "MediManage" },
    logo: { type: String, default: "" },
    primaryColor: { type: String, default: "#0ea5e9" },
    domain: { type: String, default: "" },
    doctorName: { type: String, default: "" },
    specialization: { type: String, default: "" },
  },
  isActive: { type: Boolean, default: true },
  refreshToken: { type: String, default: "" },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
