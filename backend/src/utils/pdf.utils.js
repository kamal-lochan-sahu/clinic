import PDFDocument from "pdfkit";
import { cloudinary } from "../config/cloudinary.js";
import { Readable } from "stream";

const uploadToCloudinary = (buffer, folder, format = "pdf") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `medimanage/${folder}`, format, resource_type: "raw" },
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
    Readable.from(buffer).pipe(stream);
  });

export const generatePrescriptionPDF = async (data) => {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", async () => {
      try {
        const result = await uploadToCloudinary(Buffer.concat(buffers), "prescriptions");
        resolve(result.secure_url);
      } catch (err) { reject(err); }
    });

    doc.fontSize(20).fillColor("#0ea5e9").text(data.clinicName || "MediManage", { align: "center" });
    doc.fontSize(12).fillColor("#666").text(data.doctorName || "", { align: "center" });
    doc.fontSize(10).fillColor("#666").text(data.specialization || "", { align: "center" });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#0ea5e9");
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#000").text("PRESCRIPTION", { align: "center", underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#333");
    doc.text("Patient: " + data.patientName, 50);
    doc.text("Patient ID: " + data.patientId, 50);
    doc.text("Date: " + new Date(data.date).toLocaleDateString("en-IN"), 50);
    doc.moveDown();

    if (data.diagnosis && data.diagnosis.length > 0) {
      doc.fontSize(11).fillColor("#0ea5e9").text("Diagnosis:");
      doc.fontSize(10).fillColor("#333").text(data.diagnosis.join(", "));
      doc.moveDown();
    }

    doc.fontSize(11).fillColor("#0ea5e9").text("Rx - Medicines:");
    doc.moveDown(0.3);
    (data.medicines || []).forEach((med, i) => {
      doc.fontSize(10).fillColor("#000").text((i + 1) + ". " + med.name + " - " + med.dosage);
      doc.fontSize(9).fillColor("#555").text("   " + med.frequency + " | " + med.duration + " | " + med.timing);
      doc.moveDown(0.3);
    });

    if (data.advice) {
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor("#0ea5e9").text("Advice:");
      doc.fontSize(10).fillColor("#333").text(data.advice);
    }

    if (data.nextVisit) {
      doc.moveDown();
      doc.fontSize(10).fillColor("#333").text("Next Visit: " + new Date(data.nextVisit).toLocaleDateString("en-IN"));
    }

    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#ccc");
    doc.moveDown(0.5);
    doc.fontSize(9).fillColor("#999").text("Doctor Signature: ____________________", { align: "right" });
    doc.end();
  });
};

export const generateReceiptPDF = async (data) => {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", async () => {
      try {
        const result = await uploadToCloudinary(Buffer.concat(buffers), "receipts");
        resolve(result.secure_url);
      } catch (err) { reject(err); }
    });

    doc.fontSize(20).fillColor("#0ea5e9").text(data.clinicName || "MediManage", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor("#000").text("RECEIPT", { align: "center", underline: true });
    doc.moveDown();
    doc.fontSize(10).fillColor("#333");
    doc.text("Receipt No: " + data.receiptNumber);
    doc.text("Date: " + new Date(data.date).toLocaleDateString("en-IN"));
    doc.text("Patient: " + data.patientName);
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#ccc");
    doc.moveDown(0.5);

    (data.items || []).forEach((item) => {
      const y = doc.y;
      doc.text(item.description, 50, y);
      doc.text("Rs." + item.amount, 450, y);
      doc.moveDown(0.3);
    });

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#000");
    doc.moveDown(0.3);
    doc.fontSize(12).text("Total: Rs." + data.totalAmount, 450);
    doc.fontSize(10).text("Paid: Rs." + data.paidAmount, 450);
    if (data.dueAmount > 0) doc.fillColor("red").text("Due: Rs." + data.dueAmount, 450);
    doc.moveDown();
    doc.fillColor("#999").fontSize(9).text("Thank you for visiting. Get well soon!", { align: "center" });
    doc.end();
  });
};
