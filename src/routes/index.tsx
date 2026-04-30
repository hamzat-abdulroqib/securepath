import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAuth } from "@/hooks/useAuth";
import { useLiveData } from "@/hooks/useLiveData";
import { ReportDialog } from "@/components/ReportDialog";
import { PingButton } from "@/components/PingButton";
import { Filters } from "@/components/Filters";
import { Toaster, toast } from "sonner";
import {
  distanceMeters,
  formatDistance,
  getBearingDirection,
  INCIDENT_TYPES,
  SEVERITY_LEVELS,
  STATUS_OPTIONS,
  SEVERITY_COLORS,
} from "@/lib/geo";
import { supabase } from "@/integrations/supabase/client";
import { ChevronUp, MapPin, ShieldAlert, LogIn, LogOut, List, Map as MapIcon, Bell } from "lucide-react";
import type { Report } from "@/hooks/useLiveData";
import { FeedView } from "@/components/FeedView";
import { IncidentDetails } from "@/components/IncidentDetails";
import { Button } from "@/components/ui/button";

const SafetyMap = lazy(() => import("@/components/SafetyMap"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nigeria Safety Heatmap — Live community alerts" },
      {
        name: "description",
        content:
          "Mobile-first safety heatmap for Nigeria. Report incidents, send urgent ping alerts, and see live risk near you.",
      },
      { property: "og:title", content: "Nigeria Safety Heatmap" },
      { property: "og:description", content: "Live community-powered safety alerts and heatmap." },
    ],
  }),
  component: Index,
});

function Index() {
  const { position, isFallback } = useGeolocation();
  const { user, isAnonymous } = useAuth();
  const { reports, pings } = useLiveData();

  // Map filter state
  const [radius, setRadius] = useState(1000);
  const [windowH, setWindowH] = useState(72);
  const [types, setTypes] = useState<Set<string>>(new Set(INCIDENT_TYPES.map((t) => t.value)));
  const [severities, setSeverities] = useState<Set<string>>(new Set(SEVERITY_LEVELS.map((s) => s.value)));
  const [statuses, setStatuses] = useState<Set<string>>(new Set(["active"]));
  const [alertRadius, setAlertRadius] = useState(5000);

  // UI state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const [alertedPings, setAlertedPings] = useState<Set<string>>(new Set());
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // ─── Proximity alert for new reports (configurable radius) ───────
  useEffect(() => {
    const handleNewReport = (e: Event) => {
      const customEvent = e as CustomEvent<Report>;
      const r = customEvent.detail;
      if (!position) return;

      const d = distanceMeters(position, { lat: r.latitude, lng: r.longitude });

      if (d <= alertRadius) {
        const direction = getBearingDirection(position, { lat: r.latitude, lng: r.longitude });
        const sevColor = SEVERITY_COLORS[r.severity] || SEVERITY_COLORS.medium;

        toast.error(
          `⚠️ New ${r.severity.toUpperCase()} incident — ${formatDistance(d)} ${direction}`,
          {
            description: `${r.incident_type}${r.description ? `: ${r.description.slice(0, 80)}` : ""}`,
            duration: 12000,
            action: {
              label: "View Details",
              onClick: () => setSelectedReport(r),
            },
          }
        );

        // Push notification
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("⚠️ Nigeria Safety: Nearby Incident", {
            body: `${r.severity.toUpperCase()} ${r.incident_type} reported ${formatDistance(d)} ${direction} from you.`,
            tag: `incident-${r.id}`,
          });
        }

        // Trigger marker pulse animation on the map
        window.dispatchEvent(new CustomEvent("pulse-marker", { detail: r.id }));
      }
    };

    window.addEventListener("new-report-alert", handleNewReport);
    return () => window.removeEventListener("new-report-alert", handleNewReport);
  }, [position, alertRadius]);

  // ─── Filter visible reports ───────────────────────────────────────
  const visibleReports = useMemo(() => {
    if (!position) return [];
    const cutoff = Date.now() - windowH * 60 * 60 * 1000;
    return reports.filter((r) => {
      if (!types.has(r.incident_type)) return false;
      if (!severities.has(r.severity)) return false;
      if (!statuses.has(r.status)) return false;
      if (new Date(r.created_at).getTime() < cutoff) return false;
      return distanceMeters(position, { lat: r.latitude, lng: r.longitude }) <= radius;
    });
  }, [reports, position, radius, windowH, types, severities, statuses]);

  // ─── Stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!position) return { area: "Locating…", level: "safe" as const, near: 0, pings: 0, verifiedPct: 0, critical: 0 };
    const near = visibleReports.length;
    const verified = visibleReports.filter((r) => r.confirmations_count > 0).length;
    const critical = visibleReports.filter((r) => r.severity === "critical" || r.severity === "high").length;
    const activePings = pings.filter(
      (p) => distanceMeters(position, { lat: p.latitude, lng: p.longitude }) <= 500,
    ).length;

    let level: "safe" | "aware" | "warn" | "danger" = "safe";
    if (activePings > 0 || critical > 0) level = "danger";
    else if (near >= 5) level = "warn";
    else if (near >= 2) level = "aware";

    return {
      area: isFallback ? "Lagos (default)" : "Your area",
      level,
      near,
      pings: activePings,
      verifiedPct: near ? Math.round((verified / near) * 100) : 0,
      critical,
    };
  }, [visibleReports, pings, position, isFallback]);

  // ─── Ping proximity alert ────────────────────────────────────────
  useEffect(() => {
    if (!position) return;
    pings.forEach((p) => {
      if (alertedPings.has(p.id)) return;
      const d = distanceMeters(position, { lat: p.latitude, lng: p.longitude });
      if (d <= 300) {
        toast.error(`🚨 URGENT ping ${formatDistance(d)} away`, { duration: 8000 });
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("🚨 Nigeria Safety: Urgent ping nearby", {
            body: `${formatDistance(d)} from you`,
            tag: `ping-${p.id}`,
          });
        }
        setAlertedPings((prev) => new Set(prev).add(p.id));
      }
    });
  }, [pings, position, alertedPings]);

  // ─── Request notification permission ──────────────────────────────
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // ─── Vote handlers ───────────────────────────────────────────────
  const voteReport = async (id: string, kind: "confirm" | "flag") => {
    if (!user || isAnonymous) return toast.error("Sign in to vote on incidents");
    const { error } = await supabase
      .from("confirmations")
      .insert({ user_id: user.id, report_id: id, kind });
    if (error) {
      const dup = error.message.toLowerCase().includes("duplicate") || error.code === "23505";
      toast.error(dup ? "You've already voted on this incident" : error.message);
    } else {
      toast.success(kind === "confirm" ? "👍 Upvoted — marked as credible" : "👎 Debunked — flagged as inaccurate");
    }
  };

  const confirmPing = async (id: string) => {
    if (!user || isAnonymous) return toast.error("Sign in to confirm");
    const { error } = await supabase.from("confirmations").insert({ user_id: user.id, ping_id: id, kind: "confirm" });
    if (error) {
      const dup = error.message.toLowerCase().includes("duplicate") || error.code === "23505";
      toast.error(dup ? "Already confirmed" : error.message);
    } else toast.success("Confirmed — ping extended");
  };

  // ─── Level styles ────────────────────────────────────────────────
  const levelStyles = {
    safe: { dot: "bg-[var(--safe)]", text: "text-[var(--safe)]", label: "Safe Zone" },
    aware: { dot: "bg-[var(--aware)]", text: "text-[var(--aware)]", label: "Stay Aware" },
    warn: { dot: "bg-[var(--warn)]", text: "text-[var(--warn)]", label: "Elevated Risk" },
    danger: { dot: "bg-destructive", text: "text-destructive", label: "Active Alert" },
  } as const;
  const ls = levelStyles[stats.level];

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      <Toaster position="top-center" richColors closeButton />

      {/* ─── Top status bar ─────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-[600] p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-[var(--shadow-soft)] border border-border px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
              <span className={`h-2 w-2 rounded-full ${ls.dot} animate-pulse`} />
              <span className={ls.text}>{ls.label}</span>
            </div>
            <h1 className="text-lg font-bold flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              {stats.area}
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Alert radius indicator */}
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                <Bell className="h-3 w-3" />
                Alert: {alertRadius >= 1000 ? `${alertRadius / 1000}km` : `${alertRadius}m`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black leading-none">{stats.near}</div>
              <div className="text-[10px] uppercase text-muted-foreground tracking-wider">In radius</div>
            </div>
            {user && !isAnonymous ? (
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  toast.success("Signed out");
                }}
                title="Sign out"
                className="h-10 w-10 rounded-full bg-secondary hover:bg-accent flex items-center justify-center transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to="/auth"
                title="Sign in"
                className="h-10 px-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 text-xs font-bold transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ─── Map ────────────────────────────────────────────────── */}
      <main className="absolute inset-0">
        {position ? (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-2">
                  <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm">Loading map…</p>
                </div>
              </div>
            }
          >
            <SafetyMap
              user={position}
              radius={radius}
              reports={visibleReports}
              pings={pings}
              onVoteReport={voteReport}
              onConfirmPing={confirmPing}
              onSelectReport={setSelectedReport}
            />
          </Suspense>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <ShieldAlert className="h-10 w-10 mx-auto mb-2 text-primary animate-pulse" />
              <p className="font-semibold">Getting your location…</p>
              <p className="text-xs">Please allow location access for accurate results.</p>
            </div>
          </div>
        )}
      </main>

      {/* ─── Floating report button ─────────────────────────────── */}
      {position && (
        <div className="fixed right-5 bottom-[calc(12rem+env(safe-area-inset-bottom))] z-[2600] pointer-events-auto">
          {user && !isAnonymous ? (
            <ReportDialog lat={position.lat} lng={position.lng} userId={user.id} />
          ) : (
            <Link
              to="/auth"
              aria-label="Sign in to report"
              title="Sign in to report an incident"
              className="h-14 w-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center shadow-lg transition-colors"
            >
              <LogIn className="h-6 w-6" />
            </Link>
          )}
        </div>
      )}

      {/* ─── Bottom Sheet (Map Actions or Feed View) ────────────── */}
      <div
        className={`absolute inset-x-0 bottom-0 z-[450] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${feedOpen ? "translate-y-0 h-[85dvh]" : "translate-y-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] p-3 pointer-events-none"}`}
      >
        {feedOpen ? (
          <div className="h-full pointer-events-auto relative shadow-[0_-10px_40px_rgb(0,0,0,0.2)] rounded-t-3xl bg-background flex flex-col">
            <button
              onClick={() => setFeedOpen(false)}
              className="absolute -top-14 right-4 bg-card p-3 rounded-full shadow-lg border border-border flex items-center justify-center text-primary hover:bg-accent transition-colors"
            >
              <MapIcon className="h-6 w-6" />
            </button>
            <FeedView
              reports={reports}
              userPos={position}
              onSelectReport={setSelectedReport}
              filterTypes={types}
              filterSeverities={severities}
              filterStatuses={statuses}
            />
          </div>
        ) : (
          <div className="relative bg-card rounded-3xl shadow-[var(--shadow-soft)] border border-border p-4 space-y-3 pointer-events-auto">
            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-2">
              <Stat value={stats.pings} label="Pings" tone="danger" />
              <Stat value={stats.near} label={`${windowH}h`} tone="warn" />
              <Stat value={stats.critical} label="Urgent" tone="danger" />
              <Stat value={`${stats.verifiedPct}%`} label="Verified" tone="primary" />
            </div>

            {position && (user && !isAnonymous ? (
              <PingButton lat={position.lat} lng={position.lng} userId={user.id} />
            ) : (
              <Link
                to="/auth"
                className="w-full h-14 rounded-2xl bg-destructive/90 hover:bg-destructive text-destructive-foreground text-base font-bold shadow-[var(--shadow-ping)] flex items-center justify-center gap-2 transition-colors"
              >
                <LogIn className="h-5 w-5" />
                Sign in to send Ping Alert
              </Link>
            ))}

            <button
              onClick={() => setSheetOpen((v) => !v)}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground py-1 transition-colors"
            >
              <ChevronUp className={`h-4 w-4 transition ${sheetOpen ? "rotate-180" : ""}`} />
              {sheetOpen ? "Hide filters" : "Filters & settings"}
            </button>

            {sheetOpen && (
              <div className="pt-2 border-t border-border space-y-3">
                <Filters
                  radius={radius}
                  setRadius={setRadius}
                  windowH={windowH}
                  setWindowH={setWindowH}
                  types={types}
                  setTypes={setTypes}
                  severities={severities}
                  setSeverities={setSeverities}
                  statuses={statuses}
                  setStatuses={setStatuses}
                  alertRadius={alertRadius}
                  setAlertRadius={setAlertRadius}
                />
                <div className="flex gap-3 text-[11px] flex-wrap pt-1">
                  <Legend color="var(--danger)" label="≤100m Immediate" />
                  <Legend color="var(--warn)" label="≤300m Nearby" />
                  <Legend color="var(--aware)" label="≤500m Aware" />
                  <Legend color="var(--safe)" label=">500m Safe" />
                </div>
              </div>
            )}

            <Button
              onClick={() => setFeedOpen(true)}
              variant="secondary"
              className="w-full h-12 rounded-xl flex gap-2 font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <List className="h-5 w-5" />
              View Live Feed & Near Me
            </Button>
          </div>
        )}
      </div>

      {/* ─── Incident Detail Modal ──────────────────────────────── */}
      <IncidentDetails
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        userPos={position}
        currentUserId={user?.id}
        onVoteReport={voteReport}
      />
    </div>
  );
}

function Stat({ value, label, tone }: { value: number | string; label: string; tone: "danger" | "warn" | "primary" }) {
  const colors = {
    danger: "text-destructive",
    warn: "text-[var(--warn)]",
    primary: "text-primary",
  };
  return (
    <div className="bg-secondary/60 rounded-xl px-2 py-2 text-center">
      <div className={`text-xl font-black leading-none ${colors[tone]}`}>{value}</div>
      <div className="text-[10px] uppercase text-muted-foreground tracking-wider mt-1">{label}</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}


