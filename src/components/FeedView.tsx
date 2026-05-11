import { useState, useMemo, useEffect, useRef } from "react";
import type { Report } from "@/hooks/useLiveData";
import { formatDistanceToNow } from "date-fns";
import {
  distanceMeters,
  getBearingDirection,
  formatDistance,
  getUrgencyScore,
  urgencyBadge,
  isRecentReport,
  INCIDENT_COLORS,
  INCIDENT_ICONS,
  SEVERITY_COLORS,
  STATUS_COLORS,
  STATUS_ICONS,
} from "@/lib/geo";
import { MapPin, Clock, AlertTriangle, Shield, TrendingUp, Navigation } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  reports: Report[];
  userPos: { lat: number; lng: number } | null;
  onSelectReport: (report: Report) => void;
  filterTypes?: Set<string>;
  filterSeverities?: Set<string>;
  filterStatuses?: Set<string>;
};

export function FeedView({ reports, userPos, onSelectReport, filterTypes, filterSeverities, filterStatuses }: Props) {
  const [tab, setTab] = useState<"all" | "near">("all");
  const [prevCount, setPrevCount] = useState(reports.length);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track new items for animation
  useEffect(() => {
    if (reports.length > prevCount) {
      const existingIds = new Set(reports.slice(reports.length - prevCount).map((r) => r.id));
      const fresh = reports.filter((r) => !existingIds.has(r.id)).map((r) => r.id);
      if (fresh.length > 0) {
        setNewIds((prev) => {
          const next = new Set(prev);
          fresh.forEach((id) => next.add(id));
          return next;
        });
        // Clear new status after 4 seconds
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setNewIds(new Set()), 4000);
      }
    }
    setPrevCount(reports.length);
  }, [reports.length, prevCount, reports]);

  // Apply filters
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (filterTypes && filterTypes.size > 0 && !filterTypes.has(r.incident_type)) return false;
      if (filterSeverities && filterSeverities.size > 0 && !filterSeverities.has(r.severity)) return false;
      if (filterStatuses && filterStatuses.size > 0 && !filterStatuses.has(r.status)) return false;
      return true;
    });
  }, [reports, filterTypes, filterSeverities, filterStatuses]);

  const sortedReports = useMemo(() => {
    if (tab === "all") {
      return [...filteredReports].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      if (!userPos) return filteredReports;
      return [...filteredReports].sort((a, b) => {
        const distA = distanceMeters(userPos, { lat: a.latitude, lng: a.longitude });
        const distB = distanceMeters(userPos, { lat: b.latitude, lng: b.longitude });
        return distA - distB;
      });
    }
  }, [filteredReports, tab, userPos]);

  const allCount = filteredReports.length;
  const nearCount = userPos
    ? filteredReports.filter((r) => distanceMeters(userPos, { lat: r.latitude, lng: r.longitude }) <= 10000).length
    : 0;

  return (
    <div className="flex flex-col h-full bg-background rounded-t-3xl overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3 border-b border-border shrink-0 bg-card/80 backdrop-blur-xl">
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-3" />
        <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "near")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl h-11">
            <TabsTrigger value="all" className="rounded-lg font-bold text-sm gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Live Feed
              <span className="ml-1 bg-primary/15 text-primary text-[10px] font-black px-1.5 py-0.5 rounded-full">{allCount}</span>
            </TabsTrigger>
            <TabsTrigger value="near" className="rounded-lg font-bold text-sm gap-1.5" disabled={!userPos}>
              <Navigation className="h-3.5 w-3.5" />
              Near Me
              {userPos && <span className="ml-1 bg-destructive/15 text-destructive text-[10px] font-black px-1.5 py-0.5 rounded-full">{nearCount}</span>}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Feed list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {sortedReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center space-y-3">
            {tab === "near" ? (
              <>
                <Shield className="h-12 w-12 opacity-20" />
                <p className="font-bold text-lg">No incidents near you</p>
                <p className="text-sm">Stay safe! 🛡️ Your area is clear.</p>
              </>
            ) : (
              <>
                <AlertTriangle className="h-12 w-12 opacity-20" />
                <p className="font-bold text-lg">No active incidents</p>
                <p className="text-sm">The community feed is quiet right now.</p>
              </>
            )}
          </div>
        ) : (
          sortedReports.map((r, idx) => (
            <IncidentCard
              key={r.id}
              report={r}
              userPos={userPos}
              onSelect={onSelectReport}
              isNearTab={tab === "near"}
              isNew={newIds.has(r.id) || isRecentReport(r.created_at, 3)}
              index={idx}
            />
          ))
        )}
      </div>
    </div>
  );
}

function IncidentCard({
  report: r,
  userPos,
  onSelect,
  isNearTab,
  isNew,
  index,
}: {
  report: Report;
  userPos: { lat: number; lng: number } | null;
  onSelect: (report: Report) => void;
  isNearTab: boolean;
  isNew: boolean;
  index: number;
}) {
  const dist = userPos ? distanceMeters(userPos, { lat: r.latitude, lng: r.longitude }) : null;
  const bearing = userPos ? getBearingDirection(userPos, { lat: r.latitude, lng: r.longitude }) : "";
  const distStr = dist !== null ? formatDistance(dist) : "";
  const score = r.confirmations_count - r.flags_count;
  const emoji = INCIDENT_ICONS[r.incident_type] || INCIDENT_ICONS.other;

  const urgency = dist !== null
    ? urgencyBadge(getUrgencyScore(r.severity, r.created_at, dist))
    : urgencyBadge(getUrgencyScore(r.severity, r.created_at));

  return (
    <button
      onClick={() => onSelect(r)}
      className={`w-full text-left bg-card p-4 rounded-2xl border border-border shadow-sm hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.98] group flex gap-3 items-start ${isNew ? "feed-slide-in feed-new-item" : ""}`}
      style={isNew ? { animationDelay: `${index * 50}ms` } : undefined}
    >
      {/* Category icon circle */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg shadow-sm"
        style={{ backgroundColor: `${INCIDENT_COLORS[r.incident_type] || INCIDENT_COLORS.other}18`, border: `2px solid ${INCIDENT_COLORS[r.incident_type] || INCIDENT_COLORS.other}40` }}
      >
        {emoji}
      </div>

      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex justify-between items-start mb-1 gap-2">
          <div className="flex gap-1.5 flex-wrap items-center">
            <span className="font-bold capitalize text-sm">{r.incident_type}</span>
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: SEVERITY_COLORS[r.severity] }}
            >
              {r.severity}
            </span>
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white flex items-center gap-0.5"
              style={{ backgroundColor: STATUS_COLORS[r.status] }}
            >
              {STATUS_ICONS[r.status]} {r.status.replace("_", " ")}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0 whitespace-nowrap">
            <Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(r.created_at))}
          </span>
        </div>

        {/* Description */}
        {r.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2 leading-snug">
            {r.description}
          </p>
        )}

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold min-w-0">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            {distStr ? (
              <span className="truncate">
                {isNearTab ? (
                  <span className="text-primary">{distStr}</span>
                ) : (
                  distStr
                )}
                {bearing && <span className="text-muted-foreground ml-1">{bearing}</span>}
              </span>
            ) : (
              <span className="text-muted-foreground">Location hidden</span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Urgency badge (Near Me tab) */}
            {isNearTab && (
              <span
                className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${urgency.label === "CRITICAL" ? "badge-urgent" : ""}`}
                style={{ backgroundColor: urgency.bg, color: urgency.color }}
              >
                {urgency.label}
              </span>
            )}

            {/* Credibility */}
            <div className="text-xs font-bold px-2 py-1 bg-accent rounded-lg flex gap-1 items-center">
              <span className="text-muted-foreground font-normal">Score</span>
              <span className={score > 0 ? "text-primary" : score < 0 ? "text-destructive" : ""}>
                {score > 0 ? "+" : ""}{score}
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
