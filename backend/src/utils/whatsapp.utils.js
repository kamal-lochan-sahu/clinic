import getTwilioClient from "../config/twilio.js";

export const sendWhatsApp = async (to, message) => {
  const client = getTwilioClient();
  if (!client) return { success: false, error: "Twilio not configured" };
  try {
    const msg = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_PHONE}`,
      to: `whatsapp:${to}`,
      body: message,
    });
    return { success: true, sid: msg.sid };
  } catch (error) {
    console.error("WhatsApp error:", error.message);
    return { success: false, error: error.message };
  }
};

export const appointmentConfirmMessage = (patientName, date, time, doctorName, clinicName) =>
  `Hello ${patientName}! Your appointment at ${clinicName} is confirmed.
Doctor: ${doctorName}
Date: ${date}
Time: ${time}
Please arrive 10 mins early.`;

export const appointmentReminderMessage = (patientName, date, time, doctorName, clinicName) =>
  `Reminder: Appointment tomorrow at ${clinicName}.
Doctor: ${doctorName}
Date: ${date}
Time: ${time}`;

export const followUpMessage = (patientName, date, clinicName) =>
  `Hello ${patientName}! Follow-up visit reminder at ${clinicName} on ${date}. Please don't miss it.`;

export const labReportMessage = (patientName, clinicName) =>
  `Hello ${patientName}! Your lab report is ready at ${clinicName}. Please visit or contact us.`;
