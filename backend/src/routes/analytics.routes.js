import { Router } from "express";
import { getDashboard, getRevenue, getPatients, getDiagnoses } from "../controllers/analytics.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.get("/dashboard", getDashboard);
router.get("/revenue", getRevenue);
router.get("/patients", getPatients);
router.get("/diagnoses", getDiagnoses);
export default router;
