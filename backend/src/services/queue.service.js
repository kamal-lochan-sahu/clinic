import Queue from "../models/Queue.js";
import Appointment from "../models/Appointment.js";

export const getOrCreateQueue = async (ownerId, branchId, doctorId, date) => {
  const queueDate = new Date(date);
  queueDate.setHours(0, 0, 0, 0);
  let queue = await Queue.findOne({ doctorId, date: queueDate });
  if (!queue) queue = await Queue.create({ ownerId, branchId, doctorId, date: queueDate, tokens: [], currentToken: 0 });
  return queue;
};

export const addToQueue = async (ownerId, branchId, doctorId, date, patientId, appointmentId) => {
  const queue = await getOrCreateQueue(ownerId, branchId, doctorId, date);
  const tokenNumber = queue.tokens.length + 1;
  queue.tokens.push({ tokenNumber, patientId, appointmentId, status: "waiting" });
  await queue.save();
  return { queue, tokenNumber };
};

export const callNextToken = async (doctorId, date) => {
  const queueDate = new Date(date);
  queueDate.setHours(0, 0, 0, 0);
  const queue = await Queue.findOne({ doctorId, date: queueDate }).populate("tokens.patientId", "name phone");
  if (!queue) return { queue: null, message: "no_queue" };
  const current = queue.tokens.find((t) => t.status === "in-progress");
  if (current) {
    current.status = "completed";
    current.completedAt = new Date();
    if (current.appointmentId) {
      await Appointment.findByIdAndUpdate(current.appointmentId, { status: "completed" });
    }
  }
  const next = queue.tokens.find((t) => t.status === "waiting");
  if (!next) {
    await queue.save();
    return { queue, message: "no_more_patients" };
  }
  next.status = "in-progress";
  next.calledAt = new Date();
  queue.currentToken = next.tokenNumber;
  await queue.save();
  return { queue, message: "success" };
};

export const getQueueStatus = async (doctorId, date) => {
  const queueDate = new Date(date);
  queueDate.setHours(0, 0, 0, 0);
  const queue = await Queue.findOne({ doctorId, date: queueDate }).populate("tokens.patientId", "name phone patientId");
  if (!queue) return { waiting: [], inProgress: null, completed: [], currentToken: 0, totalTokens: 0, estimatedWait: 0 };
  const waiting = queue.tokens.filter((t) => t.status === "waiting");
  return {
    waiting,
    inProgress: queue.tokens.find((t) => t.status === "in-progress") || null,
    completed: queue.tokens.filter((t) => t.status === "completed"),
    skipped: queue.tokens.filter((t) => t.status === "skipped"),
    currentToken: queue.currentToken,
    totalTokens: queue.tokens.length,
    estimatedWait: waiting.length * 15,
  };
};
