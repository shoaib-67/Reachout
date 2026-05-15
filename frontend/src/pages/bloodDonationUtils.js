export const dayOptions = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const areaOptions = ["Mirpur", "Uttara", "Dhanmondi"];
export const urgencyOptions = ["Low", "Medium", "High", "Critical"];

export const STATUS = {
  OPEN: "Open",
  ACCEPTED: "Accepted",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired"
};

export const STORAGE_KEYS = {
  donors: "reachout_blood_donors_v1",
  requests: "reachout_blood_requests_v1",
  notifications: "reachout_blood_notifications_v1",
  actingDonorId: "reachout_blood_acting_donor_v1"
};

export const initialDonors = [
  {
    id: "BD-201",
    name: "Aminul Islam",
    bloodGroup: "A+",
    area: "Mirpur",
    scheduleDays: ["Sun", "Mon", "Tue", "Wed"],
    availableFrom: "09:00",
    availableTo: "17:00",
    donationHistory: ["2026-01-11", "2025-09-15"]
  },
  {
    id: "BD-202",
    name: "Tania Akter",
    bloodGroup: "O-",
    area: "Uttara",
    scheduleDays: ["Fri", "Sat"],
    availableFrom: "15:00",
    availableTo: "20:00",
    donationHistory: ["2026-03-25"]
  },
  {
    id: "BD-203",
    name: "Siam Hasan",
    bloodGroup: "B+",
    area: "Dhanmondi",
    scheduleDays: ["Mon", "Wed", "Thu"],
    availableFrom: "10:00",
    availableTo: "14:00",
    donationHistory: []
  }
];

export const initialRequests = [
  {
    id: "REQ-701",
    patient: "Rahim Uddin",
    bloodGroup: "O+",
    hospital: "Dhaka Medical College",
    urgency: "High",
    location: "Mirpur",
    status: STATUS.OPEN,
    donorResponse: "Pending",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    acceptedBy: null
  }
];

export function safeLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function normalizeText(value) {
  return value.toString().trim().toLowerCase();
}

export function resolveArea(value) {
  const normalized = normalizeText(value);
  return areaOptions.find((item) => normalizeText(item) === normalized) || null;
}

export function toMinutes(timeValue) {
  const [h, m] = timeValue.split(":").map(Number);
  return h * 60 + m;
}

export function isDonorAvailableNow(donor, now = new Date()) {
  const currentDay = dayOptions[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  if (!donor.scheduleDays.includes(currentDay)) return false;
  const from = toMinutes(donor.availableFrom);
  const to = toMinutes(donor.availableTo);
  return currentMinutes >= from && currentMinutes <= to;
}

export function restRuleInfo(donor) {
  if (!donor.donationHistory.length) return { canDonate: true, message: "No previous donation record found." };
  const lastDate = donor.donationHistory.map((item) => new Date(item)).sort((a, b) => b - a)[0];
  const now = new Date();
  const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
  if (diffDays < 90) return { canDonate: false, message: `Rest period active. ${90 - diffDays} day(s) remaining.` };
  return { canDonate: true, message: "3-month rest rule satisfied." };
}

export function createRequestFromForm(data, sequence) {
  return {
    id: `REQ-${700 + sequence}`,
    patient: (data.get("patient") || "").toString().trim() || "Unknown patient",
    bloodGroup: (data.get("bloodGroup") || "Unknown").toString(),
    hospital: (data.get("hospital") || "").toString().trim() || "Hospital not provided",
    urgency: (data.get("urgency") || "Medium").toString(),
    location: (data.get("location") || "").toString().trim() || "Location not provided",
    status: STATUS.OPEN,
    donorResponse: "Pending",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    acceptedBy: null
  };
}

export function getCountdownLabel(expiresAt, nowMs) {
  const diff = new Date(expiresAt).getTime() - nowMs;
  if (diff <= 0) return "Expired";
  const totalSec = Math.floor(diff / 1000);
  const hh = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
