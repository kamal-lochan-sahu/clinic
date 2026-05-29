import transporter from "../config/email.js";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.CLINIC_NAME || "MediManage"}" <${process.env.SMTP_USER}>`,
      to, subject, html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email error:", error.message);
    return { success: false, error: error.message };
  }
};

export const appointmentConfirmEmail = (patientName, date, time, doctorName) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#0ea5e9;">Appointment Confirmed</h2>
  <p>Dear <strong>${patientName}</strong>,</p>
  <p>Your appointment has been confirmed.</p>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Doctor</strong></td><td style="padding:8px;border:1px solid #ddd;">${doctorName}</td></tr>
    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Date</strong></td><td style="padding:8px;border:1px solid #ddd;">${date}</td></tr>
    <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Time</strong></td><td style="padding:8px;border:1px solid #ddd;">${time}</td></tr>
  </table>
  <p style="color:#666;margin-top:20px;">Please arrive 10 minutes early.</p>
</div>`;
