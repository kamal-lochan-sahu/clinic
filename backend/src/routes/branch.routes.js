import { Router } from "express";
import { createBranch, getBranches, getBranchById, updateBranch, deleteBranch } from "../controllers/branch.controller.js";
import { verifyJWT, requireOwner } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.get("/", getBranches);
router.post("/", requireOwner, createBranch);
router.get("/:id", getBranchById);
router.put("/:id", requireOwner, updateBranch);
router.delete("/:id", requireOwner, deleteBranch);
export default router;
