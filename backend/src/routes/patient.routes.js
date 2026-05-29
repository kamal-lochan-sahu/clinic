import { Router } from "express";
import { createPatient, getPatients, getPatientById, updatePatient, getPatientHistory, searchPatients } from "../controllers/patient.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.get("/search", searchPatients);
router.get("/", getPatients);
router.post("/", createPatient);
router.get("/:id", getPatientById);
router.put("/:id", updatePatient);
router.get("/:id/history", getPatientHistory);
export default router;
