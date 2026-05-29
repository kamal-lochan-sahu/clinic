import { Router } from "express";
import { createStaff, getStaff, getStaffById, addSalary, getSalaryHistory } from "../controllers/staff.controller.js";
import { verifyJWT, requireOwner } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.get("/", getStaff);
router.post("/", requireOwner, createStaff);
router.get("/:id", getStaffById);
router.post("/:id/salary", requireOwner, addSalary);
router.get("/:id/salary-history", getSalaryHistory);
export default router;
