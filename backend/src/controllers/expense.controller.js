import Expense from "../models/Expense.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { stripProtected } from "../utils/sanitize.js";

export const createExpense = asyncHandler(async (req, res) => {
  const { amount, category } = req.body;
  if (!amount || amount <= 0) throw new ApiError(400, "Amount must be greater than 0");
  if (!category) throw new ApiError(400, "Category is required");
  const expense = await Expense.create({ ...stripProtected(req.body), ownerId: req.clinicId, addedBy: req.user._id });
  return res.status(201).json(new ApiResponse(201, expense, "Expense recorded"));
});

export const getExpenses = asyncHandler(async (req, res) => {
  const { month, year, category } = req.query;
  const query = { ownerId: req.clinicId };
  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    query.date = { $gte: start, $lt: end };
  }
  if (category) query.category = category;
  const expenses = await Expense.find(query).sort({ date: -1 });
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  return res.status(200).json(new ApiResponse(200, { expenses, total }, "Expenses fetched"));
});
