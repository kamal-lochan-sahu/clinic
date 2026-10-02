import { Router } from "express";
import { getDashboard, getRevenue, getPatients, getDiagnoses } from "../controllers/analytics.controller.js";
import { verifyJWT, requireOwner } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.get("/dashboard", getDashboard);
router.get("/revenue", requireOwner, getRevenue);
router.get("/patients", requireOwner, getPatients);
router.get("/diagnoses", requireOwner, getDiagnoses);
export default router;
