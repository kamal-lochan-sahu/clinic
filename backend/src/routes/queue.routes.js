import { Router } from "express";
import { getTodayQueue, addToQueueController, callNext, updateTokenStatus } from "../controllers/queue.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.get("/today", getTodayQueue);
router.post("/add", addToQueueController);
router.put("/call-next", callNext);
router.put("/token/:tokenId/status", updateTokenStatus);
export default router;
