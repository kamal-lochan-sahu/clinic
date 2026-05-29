import { Router } from "express";
import { createConsultation, getConsultations, getConsultationById, updateConsultation } from "../controllers/consultation.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.get("/", getConsultations);
router.post("/", createConsultation);
router.get("/:id", getConsultationById);
router.put("/:id", updateConsultation);
export default router;
