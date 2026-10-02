import { Router } from "express";
import { createStaff, getDoctors, getStaff, getStaffById, addSalary, getSalaryHistory } from "../controllers/staff.controller.js";
import { verifyJWT, requireOwner } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.get("/doctors", getDoctors);
router.get("/", requireOwner, getStaff);
router.post("/", requireOwner, createStaff);
router.get("/:id", requireOwner, getStaffById);
router.post("/:id/salary", requireOwner, addSalary);
router.get("/:id/salary-history", requireOwner, getSalaryHistory);
export default router;
