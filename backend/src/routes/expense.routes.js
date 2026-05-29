import { Router } from "express";
import { createExpense, getExpenses } from "../controllers/expense.controller.js";
import { verifyJWT, requireOwner } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.get("/", getExpenses);
router.post("/", requireOwner, createExpense);
export default router;
