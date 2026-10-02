import { Router } from "express";
import { createPrescription, getPrescriptionById, getPatientPrescriptions, createTemplate, getTemplates } from "../controllers/prescription.controller.js";
import { verifyJWT, requireDoctor } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.post("/", requireDoctor, createPrescription);
router.get("/templates", getTemplates);
router.post("/templates", requireDoctor, createTemplate);
router.get("/patient/:patientId", getPatientPrescriptions);
router.get("/:id", getPrescriptionById);
export default router;
