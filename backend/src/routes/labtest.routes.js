import { Router } from "express";
import { createLabTest, getLabTests, getLabTestById, updateLabTest, uploadReport } from "../controllers/labtest.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import multer from "multer";

const upload = multer({ dest: "/tmp/" });
const router = Router();
router.use(verifyJWT);
router.get("/", getLabTests);
router.post("/", createLabTest);
router.get("/:id", getLabTestById);
router.put("/:id", updateLabTest);
router.post("/:id/upload-report", upload.single("report"), uploadReport);
export default router;
