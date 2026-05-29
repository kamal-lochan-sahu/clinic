import cron from "node-cron";
import Medicine from "../models/Medicine.js";

export const startLowStockAlertJob = () => {
  cron.schedule("30 8 * * *", async () => {
    try {
      const lowStock = await Medicine.find({ isActive: true, $expr: { $lte: ["$stock", "$minStock"] } });
      if (lowStock.length > 0) console.log(lowStock.length + " medicines low on stock");
    } catch (err) { console.error("Low stock job error:", err.message); }
  });
  console.log("Low stock alert job scheduled (daily 8:30AM)");
};
