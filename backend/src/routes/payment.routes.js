import { Router } from "express";
import { createPayment, getPayments, getPaymentById, getDaySummary } from "../controllers/payment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.get("/day-summary", getDaySummary);
router.get("/", getPayments);
router.post("/", createPayment);
router.get("/:id", getPaymentById);
export default router;
