import { Router } from "express";
import { createMedicine, getMedicines, getMedicineById, updateMedicine, deleteMedicine, getLowStockMedicines, getExpiringMedicines, updateStock } from "../controllers/medicine.controller.js";
import { verifyJWT, requireOwner } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.get("/low-stock", getLowStockMedicines);
router.get("/expiring", getExpiringMedicines);
router.get("/", getMedicines);
router.post("/", createMedicine);
router.get("/:id", getMedicineById);
router.put("/:id", updateMedicine);
router.delete("/:id", requireOwner, deleteMedicine);
router.put("/:id/stock", updateStock);
export default router;
