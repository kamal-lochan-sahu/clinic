import twilio from "twilio";

let client = null;

const getTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn("⚠️  Twilio credentials not set — WhatsApp/SMS disabled");
    return null;
  }
  if (!client) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log("✅ Twilio Configured");
  }
  return client;
};

export default getTwilioClient;
