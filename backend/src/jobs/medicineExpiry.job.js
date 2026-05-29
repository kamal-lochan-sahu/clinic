import cron from "node-cron";
import Medicine from "../models/Medicine.js";

export const startMedicineExpiryJob = () => {
  cron.schedule("0 8 * * *", async () => {
    try {
      const thirtyDaysLater = new Date(); thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      const expiring = await Medicine.find({ isActive: true, expiryDate: { $lte: thirtyDaysLater, $gte: new Date() } });
      if (expiring.length > 0) console.log(expiring.length + " medicines expiring within 30 days");
    } catch (err) { console.error("Expiry job error:", err.message); }
  });
  console.log("Medicine expiry job scheduled (daily 8AM)");
};
