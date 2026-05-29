import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.get("/", getSettings);
router.put("/", updateSettings);
export default router;
