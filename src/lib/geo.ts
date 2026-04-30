// Distance + heat-level utilities for the Nigeria Safety Heatmap.

export type LatLng = { lat: number; lng: number };

/**
 * Haversine distance in METERS between two coordinates.
 * Standard great-circle formula on a sphere with R = 6,371,000 m.
 */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export type HeatLevel = "safe" | "aware" | "warn" | "danger";

/**
 * Map distance (meters) to a heat level relative to the user.
 * 0–100m   → danger (red)   immediate
 * 100–300m → warn (orange)  nearby
 * 300–500m → aware (yellow) awareness
 * >500m    → safe (green)
 */
export function distanceToLevel(meters: number): HeatLevel {
  if (meters <= 100) return "danger";
  if (meters <= 300) return "warn";
  if (meters <= 500) return "aware";
  return "safe";
}

/**
 * Compute a 0..1 weight for a report based on recency + confirmations.
 * Reports decay linearly to 0 over `decayHours` (default 72h).
 */
export function reportWeight(
  createdAtIso: string,
  confirmations: number,
  decayHours = 72,
): number {
  const ageMs = Date.now() - new Date(createdAtIso).getTime();
  const ageH = ageMs / (1000 * 60 * 60);
  const recency = Math.max(0, 1 - ageH / decayHours);
  // Confirmations boost: +20% per confirm, capped.
  const trust = Math.min(1.5, 1 + confirmations * 0.2);
  return Math.min(1, recency * trust);
}

/**
 * Aggregate severity (0..1) for a cluster of reports + active pings near a point.
 * Higher = more red on the heatmap.
 */
export function clusterSeverity(weights: number[], pingsNearby: number): number {
  const base = weights.reduce((s, w) => s + w, 0) / 6; // 6 weighted reports → ~saturated
  const pingBoost = Math.min(0.5, pingsNearby * 0.25);
  return Math.min(1, base + pingBoost);
}

export const HEAT_COLORS: Record<HeatLevel, string> = {
  safe: "oklch(0.62 0.18 150)",
  aware: "oklch(0.82 0.17 90)",
  warn: "oklch(0.7 0.19 55)",
  danger: "oklch(0.6 0.24 25)",
};

// ─── Category-based incident colors (for markers & badges) ───────────
export const INCIDENT_COLORS: Record<string, string> = {
  robbery: "#dc2626",     // Red
  theft: "#ea580c",       // Orange
  suspicious: "#eab308",  // Yellow
  assault: "#b91c1c",     // Dark Red
  accident: "#3b82f6",    // Blue
  fire: "#f97316",        // Orange-Red
  other: "#6b7280",       // Gray
};

// Emoji icons for each incident type (used in map markers)
export const INCIDENT_ICONS: Record<string, string> = {
  robbery: "🚨",
  theft: "🎒",
  suspicious: "👁️",
  assault: "⚠️",
  accident: "🚗",
  fire: "🔥",
  other: "📍",
};

export const SEVERITY_COLORS: Record<string, string> = {
  low: "#10b981",      // Green
  medium: "#f59e0b",   // Amber
  high: "#f97316",     // Orange
  critical: "#ef4444", // Red
};

export const SEVERITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const STATUS_COLORS: Record<string, string> = {
  active: "#ef4444",     // Red
  resolved: "#10b981",   // Green
  false_alarm: "#6b7280", // Gray
};

export const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  resolved: "Resolved",
  false_alarm: "False Alarm",
};

export const STATUS_ICONS: Record<string, string> = {
  active: "🔴",
  resolved: "✅",
  false_alarm: "⚪",
};

/**
 * Compute bearing from point A to point B and return a compass direction string.
 */
export function getBearingDirection(a: LatLng, b: LatLng): string {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (d: number) => (d * 180) / Math.PI;

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  let bearing = toDeg(Math.atan2(y, x));
  bearing = (bearing + 360) % 360;

  const directions = ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest"];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

/**
 * Format distance in meters to a human-readable string.
 * e.g. 2345 → "2.3 km", 450 → "450 m"
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

/**
 * Get an urgency level based on severity + recency + optional proximity.
 * Returns 1 (low) through 4 (critical).
 */
export function getUrgencyScore(
  severity: string,
  createdAt: string,
  distanceM?: number,
): number {
  const sevMap: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
  let score = sevMap[severity] || 2;

  // Boost for recency (within 1 hour)
  const ageMin = (Date.now() - new Date(createdAt).getTime()) / 60_000;
  if (ageMin < 15) score += 1;
  else if (ageMin < 60) score += 0.5;

  // Boost for proximity
  if (distanceM !== undefined) {
    if (distanceM < 200) score += 1;
    else if (distanceM < 1000) score += 0.5;
  }

  return Math.min(4, score);
}

/**
 * Map urgency score to a color and label.
 */
export function urgencyBadge(score: number): { color: string; bg: string; label: string } {
  if (score >= 3.5) return { color: "#fff", bg: "#dc2626", label: "CRITICAL" };
  if (score >= 2.5) return { color: "#fff", bg: "#f97316", label: "HIGH" };
  if (score >= 1.5) return { color: "#fff", bg: "#f59e0b", label: "MEDIUM" };
  return { color: "#fff", bg: "#10b981", label: "LOW" };
}

/**
 * Check if a report is "new" (created within last N minutes).
 */
export function isRecentReport(createdAt: string, thresholdMinutes = 5): boolean {
  return (Date.now() - new Date(createdAt).getTime()) < thresholdMinutes * 60_000;
}

// ─── Presets ─────────────────────────────────────────────────────────

export const RADIUS_PRESETS = [
  { label: "100 m", value: 100 },
  { label: "300 m", value: 300 },
  { label: "500 m", value: 500 },
  { label: "1 km", value: 1000 },
  { label: "3 km", value: 3000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
];

export const ALERT_RADIUS_PRESETS = [
  { label: "1 km", value: 1000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
];

export const TIME_WINDOWS = [
  { label: "24h", value: 24 },
  { label: "3 days", value: 72 },
  { label: "7 days", value: 168 },
];

export const INCIDENT_TYPES = [
  { value: "robbery", label: "Armed robbery", emoji: "🚨" },
  { value: "theft", label: "Theft", emoji: "🎒" },
  { value: "suspicious", label: "Suspicious", emoji: "👁️" },
  { value: "assault", label: "Assault", emoji: "⚠️" },
  { value: "accident", label: "Accident", emoji: "🚗" },
  { value: "fire", label: "Fire", emoji: "🔥" },
  { value: "other", label: "Other", emoji: "📍" },
] as const;

export type IncidentType = (typeof INCIDENT_TYPES)[number]["value"];

export const SEVERITY_LEVELS = [
  { value: "low", label: "Low", emoji: "🟢", color: "#10b981" },
  { value: "medium", label: "Medium", emoji: "🟡", color: "#f59e0b" },
  { value: "high", label: "High", emoji: "🟠", color: "#f97316" },
  { value: "critical", label: "Critical", emoji: "🔴", color: "#ef4444" },
] as const;

export const STATUS_OPTIONS = [
  { value: "active", label: "Active", emoji: "🔴" },
  { value: "resolved", label: "Resolved", emoji: "✅" },
  { value: "false_alarm", label: "False Alarm", emoji: "⚪" },
] as const;
