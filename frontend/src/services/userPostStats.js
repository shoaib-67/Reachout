const STORAGE_KEY = "reachout_user_post_stats_v1";

function getStoredStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredStats(stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  window.dispatchEvent(new CustomEvent("reachout:post-stats-updated"));
}

function getUserKey() {
  try {
    const raw = sessionStorage.getItem("reachout_user") || localStorage.getItem("reachout_user");
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.email || null;
  } catch {
    return null;
  }
}

function defaultCounts() {
  return {
    goodsPosts: 0,
    humanPosts: 0,
    bloodPosts: 0
  };
}

export function getUserPostCounts() {
  const userKey = getUserKey();
  if (!userKey) return defaultCounts();
  const stats = getStoredStats();
  return { ...defaultCounts(), ...(stats[userKey] || {}) };
}

export function incrementUserPostCount(type) {
  const userKey = getUserKey();
  if (!userKey) return;

  const stats = getStoredStats();
  const current = { ...defaultCounts(), ...(stats[userKey] || {}) };

  if (type === "goods") current.goodsPosts += 1;
  if (type === "human") current.humanPosts += 1;
  if (type === "blood") current.bloodPosts += 1;

  stats[userKey] = current;
  saveStoredStats(stats);
}
