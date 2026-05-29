import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./src/config/db.js";
import { connectRedis } from "./src/config/redis.js";
import connectCloudinary from "./src/config/cloudinary.js";
import { startAppointmentReminderJob } from "./src/jobs/appointmentReminder.job.js";
import { startFollowUpReminderJob } from "./src/jobs/followUpReminder.job.js";
import { startMedicineExpiryJob } from "./src/jobs/medicineExpiry.job.js";
import { startLowStockAlertJob } from "./src/jobs/lowStockAlert.job.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    connectRedis();
    connectCloudinary();

    startAppointmentReminderJob();
    startFollowUpReminderJob();
    startMedicineExpiryJob();
    startLowStockAlertJob();

    app.listen(PORT, () => {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("MediManage Backend Running");
      console.log("Port     : " + PORT);
      console.log("Env      : " + process.env.NODE_ENV);
      console.log("Health   : http://localhost:" + PORT + "/health");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();
