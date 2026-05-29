import { format, formatDistanceToNow, parseISO } from "date-fns";

export const formatDate = (date) => {
  if (!date) return "-";
  try { return format(new Date(date), "dd MMM yyyy"); }
  catch { return "-"; }
};

export const formatDateTime = (date) => {
  if (!date) return "-";
  try { return format(new Date(date), "dd MMM yyyy, hh:mm a"); }
  catch { return "-"; }
};

export const formatTime = (time) => {
  if (!time) return "-";
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  return (hour % 12 || 12) + ":" + m + " " + ampm;
};

export const timeAgo = (date) => {
  if (!date) return "-";
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); }
  catch { return "-"; }
};
