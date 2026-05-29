import { Router } from "express";
import { register, login, logout, refreshToken, getMe } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", verifyJWT, logout);
router.post("/refresh-token", refreshToken);
router.get("/me", verifyJWT, getMe);
export default router;
