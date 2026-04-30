import { useEffect, useRef, useCallback, useState } from "react";
import type { Map, LayerGroup, Marker, Circle, DivIcon } from "leaflet";
import type { Report, Ping } from "@/hooks/useLiveData";
import {
  distanceMeters,
  INCIDENT_COLORS,
  INCIDENT_ICONS,
  SEVERITY_COLORS,
  STATUS_COLORS,
  HEAT_COLORS,
  isRecentReport,
  formatDistance,
  type LatLng,
} from "@/lib/geo";

type Props = {
  user: LatLng;
  radius: number;
  reports: Report[];
  pings: Ping[];
  onVoteReport: (id: string, kind: "confirm" | "flag") => void;
  onConfirmPing: (id: string) => void;
  onSelectReport: (report: Report) => void;
};

/** Build an HTML div-icon for a report marker. */
function buildMarkerIcon(L: any, report: Report, isNew: boolean): DivIcon {
  const color = report.status === "resolved"
    ? STATUS_COLORS.resolved
    : INCIDENT_COLORS[report.incident_type] || INCIDENT_COLORS.other;
  const emoji = INCIDENT_ICONS[report.incident_type] || INCIDENT_ICONS.other;
  const size = 36 + Math.min(10, report.confirmations_count * 2);
  const resolved = report.status === "resolved" ? "resolved" : "";
  const pulseClass = isNew ? "marker-pulse" : "";
  const dropClass = isNew ? "marker-drop" : "";
  const sevColor = SEVERITY_COLORS[report.severity] || SEVERITY_COLORS.medium;

  const html = `
    <div class="incident-marker ${resolved} ${pulseClass} ${dropClass}"
         style="width:${size}px;height:${size}px;background:${color};--pulse-color:${color}80;position:relative;">
      <span style="font-size:${Math.round(size * 0.44)}px;filter:drop-shadow(0 1px 1px rgba(0,0,0,0.3));">${emoji}</span>
      ${report.severity === "critical" || report.severity === "high" ? `
        <span class="badge-urgent" style="position:absolute;top:-4px;right:-4px;width:12px;height:12px;border-radius:50%;background:${sevColor};border:2px solid white;"></span>
      ` : ""}
    </div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 4],
  });
}

function SafetyMapInner({ L, user, radius, reports, pings, onVoteReport, onConfirmPing, onSelectReport }: Props & { L: any }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const layerGroup = useRef<LayerGroup | null>(null);
  const userMarker = useRef<Marker | null>(null);
  const radiusCircle = useRef<Circle | null>(null);
  const knownReportIds = useRef<Set<string>>(new Set());

  // Init map once.
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, { zoomControl: false }).setView([user.lat, user.lng], 15);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);
    mapInstance.current = map;
    layerGroup.current = L.layerGroup().addTo(map);

    // Initialize known IDs from initial load to avoid animating everything on first render
    reports.forEach((r) => knownReportIds.current.add(r.id));

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update user position + radius.
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (!userMarker.current) {
      const html = `<div style="position:relative;width:22px;height:22px;">
        <div style="position:absolute;inset:0;border-radius:9999px;background:oklch(0.55 0.16 155);border:3px solid white;box-shadow:0 0 0 2px oklch(0.55 0.16 155 / 0.4);"></div>
        <div style="position:absolute;inset:-6px;border-radius:9999px;border:2px solid oklch(0.55 0.16 155 / 0.3);"></div>
      </div>`;
      userMarker.current = L.marker([user.lat, user.lng], {
        icon: L.divIcon({ html, className: "", iconSize: [22, 22], iconAnchor: [11, 11] }),
        zIndexOffset: 1000,
      }).addTo(map);
    } else {
      userMarker.current.setLatLng([user.lat, user.lng]);
    }

    if (radiusCircle.current) radiusCircle.current.remove();
    radiusCircle.current = L.circle([user.lat, user.lng], {
      radius,
      color: "oklch(0.55 0.16 155)",
      weight: 2,
      fillColor: "oklch(0.55 0.16 155)",
      fillOpacity: 0.06,
      dashArray: "6 6",
    }).addTo(map);
  }, [user.lat, user.lng, radius, L]);

  // Handle marker pulse event from proximity alerts.
  useEffect(() => {
    const handler = (e: Event) => {
      const reportId = (e as CustomEvent<string>).detail;
      const el = document.querySelector(`[data-report-id="${reportId}"]`);
      if (el) {
        el.classList.add("marker-pulse");
        setTimeout(() => el.classList.remove("marker-pulse"), 6000);
      }
    };
    window.addEventListener("pulse-marker", handler);
    return () => window.removeEventListener("pulse-marker", handler);
  }, []);

  // Stable reference for callbacks used in marker event handlers.
  const voteRef = useRef(onVoteReport);
  voteRef.current = onVoteReport;
  const confirmPingRef = useRef(onConfirmPing);
  confirmPingRef.current = onConfirmPing;
  const selectRef = useRef(onSelectReport);
  selectRef.current = onSelectReport;

  // Render reports + pings within radius.
  useEffect(() => {
    const map = mapInstance.current;
    const group = layerGroup.current;
    if (!map || !group) return;
    group.clearLayers();

    const newKnown = new Set<string>();

    reports.forEach((r) => {
      newKnown.add(r.id);
      const d = distanceMeters(user, { lat: r.latitude, lng: r.longitude });
      if (d > radius) return;

      const isNew = !knownReportIds.current.has(r.id) || isRecentReport(r.created_at, 5);
      const icon = buildMarkerIcon(L, r, isNew);

      const marker = L.marker([r.latitude, r.longitude], {
        icon,
        zIndexOffset: r.status === "resolved" ? 100 : 500,
      }).addTo(group);

      // Store report ID on the marker element for pulse events
      const el = marker.getElement();
      if (el) el.setAttribute("data-report-id", r.id);

      // Trust score: net votes (confirms − flags)
      const score = r.confirmations_count - r.flags_count;
      const scoreColor = score > 0 ? "#10b981" : score < 0 ? "#dc2626" : "#777";
      const sevColor = SEVERITY_COLORS[r.severity] || SEVERITY_COLORS.medium;
      const statusColor = STATUS_COLORS[r.status] || STATUS_COLORS.active;
      const incidentColor = INCIDENT_COLORS[r.incident_type] || INCIDENT_COLORS.other;

      const popupHtml = `
        <div style="font-family:Inter,sans-serif;min-width:220px;max-width:280px;">
          <div style="display:flex;gap:6px;align-items:center;margin-bottom:8px;">
            <span style="background:${incidentColor};color:white;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;">${r.incident_type}</span>
            <span style="background:${sevColor};color:white;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;">${r.severity}</span>
            <span style="background:${statusColor};color:white;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;">${r.status}</span>
          </div>
          ${r.description ? `<div style="font-size:13px;color:#444;margin-bottom:8px;line-height:1.4;">${escapeHtml(r.description.slice(0, 120))}${r.description.length > 120 ? "…" : ""}</div>` : ""}
          <div style="font-size:12px;color:#777;margin-bottom:10px;display:flex;align-items:center;gap:4px;">
            📍 ${formatDistance(d)} away
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;background:#f3f4f6;border-radius:10px;margin-bottom:10px;">
            <span style="font-size:12px;color:#555;">Credibility</span>
            <span style="font-weight:800;font-size:14px;color:${scoreColor};">${score > 0 ? "+" : ""}${score}</span>
          </div>
          <div style="display:flex;gap:6px;margin-bottom:8px;">
            <button id="up-${r.id}" title="Upvote — this looks accurate" style="flex:1;padding:7px 8px;border:0;border-radius:8px;background:#10b981;color:white;font-weight:600;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;gap:4px;">
              👍 ${r.confirmations_count}
            </button>
            <button id="down-${r.id}" title="Debunk — this seems inaccurate" style="flex:1;padding:7px 8px;border:0;border-radius:8px;background:#dc2626;color:white;font-weight:600;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;gap:4px;">
              👎 ${r.flags_count}
            </button>
          </div>
          <button id="detail-${r.id}" style="width:100%;padding:8px;border:2px solid #e5e7eb;border-radius:8px;background:white;color:#333;font-weight:600;cursor:pointer;font-size:12px;">
            View Full Details →
          </button>
        </div>`;

      marker.bindPopup(popupHtml, { maxWidth: 300, className: "incident-popup" });
      marker.on("popupopen", () => {
        document.getElementById(`up-${r.id}`)?.addEventListener("click", () => {
          voteRef.current(r.id, "confirm");
          map.closePopup();
        });
        document.getElementById(`down-${r.id}`)?.addEventListener("click", () => {
          voteRef.current(r.id, "flag");
          map.closePopup();
        });
        document.getElementById(`detail-${r.id}`)?.addEventListener("click", () => {
          selectRef.current(r);
          map.closePopup();
        });
      });
    });

    knownReportIds.current = newKnown;

    // Pings
    pings.forEach((p) => {
      const d = distanceMeters(user, { lat: p.latitude, lng: p.longitude });
      if (d > Math.max(radius, 1500)) return; // pings always visible if reasonably close
      const html = `<div style="position:relative;width:32px;height:32px;">
        <div class="ping-ring" style="position:absolute;inset:0;border-radius:9999px;background:${HEAT_COLORS.danger};opacity:0.5;"></div>
        <div class="marker-glow-ring" style="position:absolute;inset:-8px;border-radius:9999px;border:2px solid ${HEAT_COLORS.danger};opacity:0.4;"></div>
        <div style="position:absolute;inset:6px;border-radius:9999px;background:${HEAT_COLORS.danger};border:3px solid white;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:10px;">🚨</span>
        </div>
      </div>`;
      const marker = L.marker([p.latitude, p.longitude], {
        icon: L.divIcon({ html, className: "", iconSize: [32, 32], iconAnchor: [16, 16] }),
        zIndexOffset: 900,
      }).addTo(group);

      const minsLeft = Math.max(0, Math.round((new Date(p.expires_at).getTime() - Date.now()) / 60_000));
      const popup = `
        <div style="font-family:Inter,sans-serif;min-width:200px;">
          <div style="font-weight:700;color:${HEAT_COLORS.danger};font-size:15px;margin-bottom:4px;">🚨 URGENT PING</div>
          <div style="font-size:12px;color:#555;margin-top:4px;">${formatDistance(d)} away · ${p.confirmations_count} confirms</div>
          <div style="font-size:11px;color:#777;margin-top:2px;">Expires in ${minsLeft} min</div>
          <button id="cping-${p.id}" style="margin-top:10px;width:100%;padding:8px 10px;border:0;border-radius:8px;background:${HEAT_COLORS.danger};color:white;font-weight:600;cursor:pointer;font-size:12px;">Confirm I see it</button>
        </div>`;
      marker.bindPopup(popup);
      marker.on("popupopen", () => {
        document.getElementById(`cping-${p.id}`)?.addEventListener("click", () => {
          confirmPingRef.current(p.id);
          map.closePopup();
        });
      });
    });
  }, [reports, pings, radius, user, L]);

  return <div ref={mapRef} className="absolute inset-0" />;
}

export default function SafetyMap(props: Props) {
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    import("leaflet").then((leafletModule) => {
      const leaflet = leafletModule.default;
      delete (leaflet.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setL(leaflet);
    });
  }, []);

  if (!L) return null;

  return <SafetyMapInner L={L} {...props} />;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
