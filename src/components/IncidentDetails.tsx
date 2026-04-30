import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send, MapPin, Clock, Camera, ThumbsUp, ThumbsDown,
  Navigation, Shield, AlertTriangle, X, Maximize2, ChevronDown,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { Report } from "@/hooks/useLiveData";
import { useComments } from "@/hooks/useComments";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  distanceMeters,
  getBearingDirection,
  formatDistance,
  getUrgencyScore,
  urgencyBadge,
  INCIDENT_COLORS,
  INCIDENT_ICONS,
  SEVERITY_COLORS,
  SEVERITY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_ICONS,
} from "@/lib/geo";
import type { Map } from "leaflet";

type Props = {
  report: Report | null;
  onClose: () => void;
  userPos: { lat: number; lng: number } | null;
  currentUserId: string | undefined;
  onVoteReport: (id: string, kind: "confirm" | "flag") => void;
};

export function IncidentDetails({ report, onClose, userPos, currentUserId, onVoteReport }: Props) {
  const { comments, loading } = useComments(report?.id || null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mediaExpanded, setMediaExpanded] = useState(false);
  const miniMapRef = useRef<HTMLDivElement>(null);
  const miniMapInstance = useRef<Map | null>(null);

  // Initialize mini-map when report changes
  useEffect(() => {
    if (!report || !miniMapRef.current) return;

    // Clean up previous instance
    if (miniMapInstance.current) {
      miniMapInstance.current.remove();
      miniMapInstance.current = null;
    }

    // Small delay to ensure the DOM is ready
    const timer = setTimeout(async () => {
      if (!miniMapRef.current) return;

      const L = (await import("leaflet")).default;

      const map = L.map(miniMapRef.current, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        attributionControl: false,
      }).setView([report.latitude, report.longitude], 16);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Add incident marker
      const color = report.status === "resolved"
        ? STATUS_COLORS.resolved
        : INCIDENT_COLORS[report.incident_type] || INCIDENT_COLORS.other;
      const emoji = INCIDENT_ICONS[report.incident_type] || INCIDENT_ICONS.other;

      const markerHtml = `
        <div class="incident-marker" style="width:40px;height:40px;background:${color};position:relative;">
          <span style="font-size:18px;filter:drop-shadow(0 1px 1px rgba(0,0,0,0.3));">${emoji}</span>
        </div>
      `;
      L.marker([report.latitude, report.longitude], {
        icon: L.divIcon({
          html: markerHtml,
          className: "",
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        }),
      }).addTo(map);

      // Add accuracy circle
      L.circle([report.latitude, report.longitude], {
        radius: 50,
        color,
        weight: 1,
        fillColor: color,
        fillOpacity: 0.1,
        dashArray: "4 4",
      }).addTo(map);

      miniMapInstance.current = map;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (miniMapInstance.current) {
        miniMapInstance.current.remove();
        miniMapInstance.current = null;
      }
    };
  }, [report?.id, report?.latitude, report?.longitude, report?.incident_type, report?.status]);

  if (!report) return null;

  const dist = userPos ? distanceMeters(userPos, { lat: report.latitude, lng: report.longitude }) : 0;
  const bearing = userPos ? getBearingDirection(userPos, { lat: report.latitude, lng: report.longitude }) : "";
  const distStr = formatDistance(dist);

  const score = report.confirmations_count - report.flags_count;
  const totalVotes = report.confirmations_count + report.flags_count;
  const confirmPct = totalVotes > 0 ? (report.confirmations_count / totalVotes) * 100 : 50;

  const urgency = userPos
    ? urgencyBadge(getUrgencyScore(report.severity, report.created_at, dist))
    : urgencyBadge(getUrgencyScore(report.severity, report.created_at));

  const incidentColor = INCIDENT_COLORS[report.incident_type] || INCIDENT_COLORS.other;
  const sevColor = SEVERITY_COLORS[report.severity] || SEVERITY_COLORS.medium;
  const statusColor = STATUS_COLORS[report.status] || STATUS_COLORS.active;

  const isVideo = report.image_url && /\.(mp4|webm|mov|avi)(\?|$)/i.test(report.image_url);

  const submitComment = async () => {
    if (!currentUserId) return toast.error("Please sign in to comment");
    if (!newComment.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.from("comments").insert({
      report_id: report.id,
      user_id: currentUserId,
      content: newComment.trim(),
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
    } else {
      setNewComment("");
    }
  };

  return (
    <Dialog open={!!report} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md h-[92dvh] sm:h-[88vh] p-0 flex flex-col rounded-t-[32px] sm:rounded-2xl overflow-hidden gap-0 bg-background border-border">
        {/* Hero Section — Media or Map */}
        <div className="relative h-52 shrink-0 bg-accent/30 overflow-hidden">
          {report.image_url ? (
            <>
              {isVideo ? (
                <video
                  src={report.image_url}
                  controls
                  className="w-full h-full object-cover"
                  playsInline
                />
              ) : (
                <img
                  src={report.image_url}
                  alt={`${report.incident_type} incident`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setMediaExpanded(true)}
                />
              )}
              {!isVideo && (
                <button
                  onClick={() => setMediaExpanded(true)}
                  className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
              <Camera className="h-16 w-16" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Badges over hero */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between">
            <div>
              <div className="flex gap-1.5 mb-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white shadow-sm" style={{ backgroundColor: incidentColor }}>
                  {INCIDENT_ICONS[report.incident_type]} {report.incident_type}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white shadow-sm" style={{ backgroundColor: sevColor }}>
                  {SEVERITY_LABELS[report.severity] || report.severity}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white shadow-sm" style={{ backgroundColor: statusColor }}>
                  {STATUS_ICONS[report.status]} {STATUS_LABELS[report.status]}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white capitalize drop-shadow-md">
                {report.incident_type} Incident
              </h2>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 ${urgency.label === "CRITICAL" ? "badge-urgent" : ""}`}
              style={{ backgroundColor: urgency.bg, color: urgency.color }}
            >
              {urgency.label}
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-5">
            {/* Info row */}
            <div className="flex justify-between items-start text-sm gap-3">
              <div className="flex flex-col gap-1.5 text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>{formatDistanceToNow(new Date(report.created_at))} ago</span>
                  <span className="text-[10px] text-muted-foreground/60">
                    ({format(new Date(report.created_at), "MMM d, h:mm a")})
                  </span>
                </span>
                {userPos && (
                  <span className="flex items-center gap-1.5">
                    <Navigation className="h-4 w-4 shrink-0" />
                    <span className="font-semibold text-foreground">{distStr}</span>
                    <span>{bearing}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {report.description && (
              <div>
                <h3 className="text-sm font-bold mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-primary" /> Description
                </h3>
                <p className="text-sm text-foreground/90 bg-accent/20 p-3.5 rounded-xl border border-border/50 leading-relaxed">
                  {report.description}
                </p>
              </div>
            )}

            {/* Mini Map */}
            <div>
              <h3 className="text-sm font-bold mb-1.5 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" /> Location
              </h3>
              <div className="mini-map-container" style={{ height: 180 }}>
                <div ref={miniMapRef} style={{ height: "100%", width: "100%" }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
              </p>
            </div>

            {/* Status Timeline */}
            <div>
              <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary" /> Timeline
              </h3>
              <div className="relative pl-6 space-y-3">
                {/* Timeline line */}
                <div className="absolute left-[9px] top-1 bottom-1 w-0.5 bg-border" />

                {/* Reported */}
                <TimelineItem
                  color={incidentColor}
                  title="Incident Reported"
                  time={format(new Date(report.created_at), "MMM d, yyyy · h:mm a")}
                  active
                />

                {/* Votes activity */}
                {totalVotes > 0 && (
                  <TimelineItem
                    color="#3b82f6"
                    title={`${totalVotes} community vote${totalVotes !== 1 ? "s" : ""}`}
                    time={`${report.confirmations_count} confirmed · ${report.flags_count} flagged`}
                    active
                  />
                )}

                {/* Current status */}
                <TimelineItem
                  color={statusColor}
                  title={`Status: ${STATUS_LABELS[report.status]}`}
                  time={report.status === "active" ? "Monitoring" : "Updated"}
                  active={report.status === "active"}
                />
              </div>
            </div>

            {/* Voting Section */}
            <div className="bg-secondary/40 p-4 rounded-2xl border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold">Credibility Score</span>
                <span className={`text-xl font-black ${score > 0 ? "text-primary" : score < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {score > 0 ? "+" : ""}{score}
                </span>
              </div>

              {/* Vote progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>👍 {report.confirmations_count} confirmed</span>
                  <span>👎 {report.flags_count} flagged</span>
                </div>
                <div className="vote-bar">
                  <div
                    className="vote-bar-fill"
                    style={{
                      width: `${confirmPct}%`,
                      background: `linear-gradient(90deg, #10b981, ${confirmPct > 70 ? "#10b981" : confirmPct > 30 ? "#f59e0b" : "#ef4444"})`,
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => onVoteReport(report.id, "confirm")}
                  variant="outline"
                  className="flex-1 bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors gap-1.5"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Upvote
                </Button>
                <Button
                  onClick={() => onVoteReport(report.id, "flag")}
                  variant="outline"
                  className="flex-1 bg-background hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors gap-1.5"
                >
                  <ThumbsDown className="h-4 w-4" />
                  Debunk
                </Button>
              </div>
            </div>

            {/* Comments */}
            <div>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                Community Updates
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-black">
                  {comments.length}
                </span>
              </h3>
              <div className="space-y-2.5 mb-4">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-accent/20 rounded-xl p-3 border border-border/50">
                        <div className="h-3 w-24 bg-muted rounded shimmer mb-2" />
                        <div className="h-3 w-full bg-muted rounded shimmer" />
                      </div>
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-6 bg-accent/20 rounded-xl border border-border/50">
                    <ChevronDown className="h-5 w-5 mx-auto mb-1 opacity-40" />
                    No updates yet. Be the first to add context.
                  </div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="bg-card p-3.5 rounded-xl border border-border shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-primary">
                          {c.profiles?.display_name
                            ? formatPrivacyName(c.profiles.display_name)
                            : "Anonymous"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(c.created_at))} ago
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <div className="flex gap-2 relative">
                <Textarea
                  placeholder={currentUserId ? "Add an update or context..." : "Sign in to comment"}
                  className="min-h-[60px] resize-none pr-12 rounded-xl"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={!currentUserId || submitting}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitComment();
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="absolute right-2 bottom-2 h-8 w-8 rounded-lg"
                  disabled={!currentUserId || submitting || !newComment.trim()}
                  onClick={submitComment}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Media expanded overlay */}
        {mediaExpanded && report.image_url && (
          <div
            className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setMediaExpanded(false)}
          >
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
              onClick={() => setMediaExpanded(false)}
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={report.image_url}
              alt="Incident media"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TimelineItem({
  color,
  title,
  time,
  active,
}: {
  color: string;
  title: string;
  time: string;
  active: boolean;
}) {
  return (
    <div className="relative flex gap-3 items-start">
      <div
        className={`w-[18px] h-[18px] rounded-full border-[3px] border-white shrink-0 -ml-6 z-10 shadow-sm ${active ? "" : "opacity-50"}`}
        style={{ backgroundColor: color }}
      />
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${active ? "text-foreground" : "text-muted-foreground"}`}>
          {title}
        </p>
        <p className="text-[11px] text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

/**
 * Format display name for privacy: "John Doe" → "John D."
 */
function formatPrivacyName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}
