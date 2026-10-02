import Medicine from "../models/Medicine.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createMedicine = asyncHandler(async (req, res) => {
  const { stock, sellingPrice, purchasePrice, expiryDate } = req.body;
  if (stock < 0) throw new ApiError(400, "Stock cannot be negative");
  if (sellingPrice < 0) throw new ApiError(400, "Selling price cannot be negative");
  if (purchasePrice < 0) throw new ApiError(400, "Purchase price cannot be negative");
  const medicine = await Medicine.create({ ...req.body, ownerId: req.clinicId });
  return res.status(201).json(new ApiResponse(201, medicine, "Medicine added"));
});

export const getMedicines = asyncHandler(async (req, res) => {
  const { search, category, page = 1, limit = 20 } = req.query;
  const query = { ownerId: req.clinicId, isActive: true };
  if (search) query.name = { $regex: search, $options: "i" };
  if (category) query.category = category;
  const medicines = await Medicine.find(query).sort({ name: 1 }).skip((page-1)*limit).limit(Number(limit));
  const total = await Medicine.countDocuments(query);
  return res.status(200).json(new ApiResponse(200, { medicines, total }, "Medicines fetched"));
});

export const getMedicineById = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findOne({ _id: req.params.id, ownerId: req.clinicId });
  if (!medicine) throw new ApiError(404, "Medicine not found");
  return res.status(200).json(new ApiResponse(200, medicine, "Medicine fetched"));
});

export const updateMedicine = asyncHandler(async (req, res) => {
  if (req.body.stock !== undefined && req.body.stock < 0) throw new ApiError(400, "Stock cannot be negative");
  if (req.body.sellingPrice !== undefined && req.body.sellingPrice < 0) throw new ApiError(400, "Price cannot be negative");
  const medicine = await Medicine.findOneAndUpdate({ _id: req.params.id, ownerId: req.clinicId }, req.body, { new: true });
  if (!medicine) throw new ApiError(404, "Medicine not found");
  return res.status(200).json(new ApiResponse(200, medicine, "Medicine updated"));
});

export const deleteMedicine = asyncHandler(async (req, res) => {
  await Medicine.findOneAndUpdate({ _id: req.params.id, ownerId: req.clinicId }, { isActive: false });
  return res.status(200).json(new ApiResponse(200, {}, "Medicine deleted"));
});

export const getLowStockMedicines = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find({ ownerId: req.clinicId, isActive: true, $expr: { $lte: ["$stock", "$minStock"] } });
  return res.status(200).json(new ApiResponse(200, medicines, "Low stock medicines fetched"));
});

export const getExpiringMedicines = asyncHandler(async (req, res) => {
  const thirtyDaysLater = new Date(); thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
  const medicines = await Medicine.find({ ownerId: req.clinicId, isActive: true, expiryDate: { $lte: thirtyDaysLater, $gte: new Date() } });
  return res.status(200).json(new ApiResponse(200, medicines, "Expiring medicines fetched"));
});

export const updateStock = asyncHandler(async (req, res) => {
  const { quantity, operation } = req.body;
  if (!quantity || quantity <= 0) throw new ApiError(400, "Quantity must be positive");
  const medicine = await Medicine.findOne({ _id: req.params.id, ownerId: req.clinicId });
  if (!medicine) throw new ApiError(404, "Medicine not found");
  if (operation === "add") medicine.stock += Number(quantity);
  else if (operation === "subtract") {
    if (medicine.stock < quantity) throw new ApiError(400, "Insufficient stock — only " + medicine.stock + " " + medicine.unit + " available");
    medicine.stock -= Number(quantity);
  } else {
    medicine.stock = Number(quantity);
  }
  await medicine.save();
  return res.status(200).json(new ApiResponse(200, medicine, "Stock updated"));
});
