import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase, B as Button, T as Tabs, a as TabsList, b as TabsTrigger, d as cn } from "./tabs-Cp8eyMYz.mjs";
import { R as Root, T as Trigger, P as Portal, C as Content, a as Close, b as Title, D as Description, O as Overlay } from "../_libs/radix-ui__react-dialog.mjs";
import { t as toast, T as Toaster } from "../_libs/sonner.mjs";
import { M as MapPin, B as Bell, L as LogOut, a as LogIn, b as ShieldAlert, c as Map, C as ChevronUp, d as List, P as Plus, T as TriangleAlert, e as Camera, X, f as TrendingUp, N as Navigation, g as Shield, h as Siren, i as Maximize2, j as Clock, k as ThumbsUp, l as ThumbsDown, m as ChevronDown, n as Send } from "../_libs/lucide-react.mjs";
import { f as formatDistanceToNow, a as format } from "../_libs/date-fns.mjs";
import { o as objectType, s as stringType, e as enumType } from "../_libs/zod.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
const FALLBACK = { lat: 6.5244, lng: 3.3792 };
function useGeolocation() {
  const [position, setPosition] = reactExports.useState(null);
  const [accuracy, setAccuracy] = reactExports.useState(null);
  const [error, setError] = reactExports.useState(null);
  const [isFallback, setIsFallback] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setPosition(FALLBACK);
      setIsFallback(true);
      setError("Geolocation not supported");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAccuracy(pos.coords.accuracy);
        setIsFallback(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setPosition((p) => p ?? FALLBACK);
        setIsFallback(true);
      },
      { enableHighAccuracy: true, maximumAge: 1e4, timeout: 15e3 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);
  return { position, accuracy, error, isFallback };
}
function useAuth() {
  const [session, setSession] = reactExports.useState(null);
  const [user, setUser] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  return { session, user, loading, isAnonymous: !!user?.is_anonymous };
}
function useLiveData() {
  const [reports, setReports] = reactExports.useState([]);
  const [pings, setPings] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    let mounted = true;
    const load = async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString();
      const [r, p] = await Promise.all([
        supabase.from("reports").select("*").gte("created_at", sevenDaysAgo).order("created_at", { ascending: false }).limit(500),
        supabase.from("pings").select("*").order("created_at", { ascending: false }).limit(500)
      ]);
      if (!mounted) return;
      if (r.data) setReports(r.data);
      if (p.data) setPings(p.data);
      setLoading(false);
    };
    load();
    const ch = supabase.channel("safety-live").on("postgres_changes", { event: "*", schema: "public", table: "reports" }, (payload) => {
      setReports((prev) => {
        if (payload.eventType === "INSERT") {
          const newReport = payload.new;
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("new-report-alert", { detail: newReport }));
          }
          return [newReport, ...prev];
        }
        if (payload.eventType === "UPDATE")
          return prev.map((x) => x.id === payload.new.id ? payload.new : x);
        if (payload.eventType === "DELETE")
          return prev.filter((x) => x.id !== payload.old.id);
        return prev;
      });
    }).on("postgres_changes", { event: "*", schema: "public", table: "pings" }, (payload) => {
      setPings((prev) => {
        if (payload.eventType === "INSERT") return [payload.new, ...prev];
        if (payload.eventType === "UPDATE")
          return prev.map((x) => x.id === payload.new.id ? payload.new : x);
        if (payload.eventType === "DELETE")
          return prev.filter((x) => x.id !== payload.old.id);
        return prev;
      });
    }).subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, []);
  return { reports, pings, loading };
}
const Dialog = Root;
const DialogTrigger = Trigger;
const DialogPortal = Portal;
const DialogOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-[3000] bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = Overlay.displayName;
const DialogContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-[3001] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = Title.displayName;
const DialogDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = Description.displayName;
const Textarea = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
function distanceMeters(a, b) {
  const R = 6371e3;
  const toRad = (d) => d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}
const HEAT_COLORS = {
  danger: "oklch(0.6 0.24 25)"
};
const INCIDENT_COLORS = {
  robbery: "#dc2626",
  // Red
  theft: "#ea580c",
  // Orange
  suspicious: "#eab308",
  // Yellow
  assault: "#b91c1c",
  // Dark Red
  accident: "#3b82f6",
  // Blue
  fire: "#f97316",
  // Orange-Red
  other: "#6b7280"
  // Gray
};
const INCIDENT_ICONS = {
  robbery: "🚨",
  theft: "🎒",
  suspicious: "👁️",
  assault: "⚠️",
  accident: "🚗",
  fire: "🔥",
  other: "📍"
};
const SEVERITY_COLORS = {
  low: "#10b981",
  // Green
  medium: "#f59e0b",
  // Amber
  high: "#f97316",
  // Orange
  critical: "#ef4444"
  // Red
};
const SEVERITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical"
};
const STATUS_COLORS = {
  active: "#ef4444",
  // Red
  resolved: "#10b981",
  // Green
  false_alarm: "#6b7280"
  // Gray
};
const STATUS_LABELS = {
  active: "Active",
  resolved: "Resolved",
  false_alarm: "False Alarm"
};
const STATUS_ICONS = {
  active: "🔴",
  resolved: "✅",
  false_alarm: "⚪"
};
function getBearingDirection(a, b) {
  const toRad = (d) => d * Math.PI / 180;
  const toDeg = (d) => d * 180 / Math.PI;
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  let bearing = toDeg(Math.atan2(y, x));
  bearing = (bearing + 360) % 360;
  const directions = ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest"];
  const index2 = Math.round(bearing / 45) % 8;
  return directions[index2];
}
function formatDistance(meters) {
  if (meters >= 1e3) return `${(meters / 1e3).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}
function getUrgencyScore(severity, createdAt, distanceM) {
  const sevMap = { low: 1, medium: 2, high: 3, critical: 4 };
  let score = sevMap[severity] || 2;
  const ageMin = (Date.now() - new Date(createdAt).getTime()) / 6e4;
  if (ageMin < 15) score += 1;
  else if (ageMin < 60) score += 0.5;
  if (distanceM !== void 0) {
    if (distanceM < 200) score += 1;
    else if (distanceM < 1e3) score += 0.5;
  }
  return Math.min(4, score);
}
function urgencyBadge(score) {
  if (score >= 3.5) return { color: "#fff", bg: "#dc2626", label: "CRITICAL" };
  if (score >= 2.5) return { color: "#fff", bg: "#f97316", label: "HIGH" };
  if (score >= 1.5) return { color: "#fff", bg: "#f59e0b", label: "MEDIUM" };
  return { color: "#fff", bg: "#10b981", label: "LOW" };
}
function isRecentReport(createdAt, thresholdMinutes = 5) {
  return Date.now() - new Date(createdAt).getTime() < thresholdMinutes * 6e4;
}
const RADIUS_PRESETS = [
  { label: "100 m", value: 100 },
  { label: "300 m", value: 300 },
  { label: "500 m", value: 500 },
  { label: "1 km", value: 1e3 },
  { label: "3 km", value: 3e3 },
  { label: "5 km", value: 5e3 },
  { label: "10 km", value: 1e4 }
];
const ALERT_RADIUS_PRESETS = [
  { label: "1 km", value: 1e3 },
  { label: "5 km", value: 5e3 },
  { label: "10 km", value: 1e4 }
];
const TIME_WINDOWS = [
  { label: "24h", value: 24 },
  { label: "3 days", value: 72 },
  { label: "7 days", value: 168 }
];
const INCIDENT_TYPES = [
  { value: "robbery", label: "Armed robbery", emoji: "🚨" },
  { value: "theft", label: "Theft", emoji: "🎒" },
  { value: "suspicious", label: "Suspicious", emoji: "👁️" },
  { value: "assault", label: "Assault", emoji: "⚠️" },
  { value: "accident", label: "Accident", emoji: "🚗" },
  { value: "fire", label: "Fire", emoji: "🔥" },
  { value: "other", label: "Other", emoji: "📍" }
];
const SEVERITY_LEVELS = [
  { value: "low", label: "Low", emoji: "🟢", color: "#10b981" },
  { value: "medium", label: "Medium", emoji: "🟡", color: "#f59e0b" },
  { value: "high", label: "High", emoji: "🟠", color: "#f97316" },
  { value: "critical", label: "Critical", emoji: "🔴", color: "#ef4444" }
];
const STATUS_OPTIONS = [
  { value: "active", label: "Active", emoji: "🔴" },
  { value: "resolved", label: "Resolved", emoji: "✅" },
  { value: "false_alarm", label: "False Alarm", emoji: "⚪" }
];
const schema = objectType({
  incident_type: enumType(["robbery", "theft", "suspicious", "assault", "accident", "fire", "other"]),
  severity: enumType(["low", "medium", "high", "critical"]),
  description: stringType().trim().max(500).optional()
});
function ReportDialog({ lat, lng, userId }) {
  const [open, setOpen] = reactExports.useState(false);
  const [type, setType] = reactExports.useState("suspicious");
  const [severity, setSeverity] = reactExports.useState("medium");
  const [desc, setDesc] = reactExports.useState("");
  const [media, setMedia] = reactExports.useState(null);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const submit = async () => {
    if (!userId) {
      toast.error("Please sign in to report");
      return;
    }
    const parsed = schema.safeParse({ incident_type: type, severity, description: desc });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    try {
      let mediaUrl = null;
      if (media) {
        const fileExt = media.name.split(".").pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("incident-media").upload(fileName, media);
        if (uploadError) {
          console.warn("Media upload failed:", uploadError.message);
          toast.warning("Media upload failed — submitting report without image");
        } else {
          const { data: publicUrlData } = supabase.storage.from("incident-media").getPublicUrl(fileName);
          mediaUrl = publicUrlData.publicUrl;
        }
      }
      const { error } = await supabase.from("reports").insert({
        reporter_id: userId,
        incident_type: parsed.data.incident_type,
        severity: parsed.data.severity,
        description: parsed.data.description || null,
        latitude: lat,
        longitude: lng,
        image_url: mediaUrl
      });
      if (error) {
        console.error("Report insert error:", error);
        toast.error(`Failed to submit: ${error.message}`);
        return;
      }
      toast.success("Report submitted — community alerted");
      setDesc("");
      setMedia(null);
      setSeverity("medium");
      setType("suspicious");
      setOpen(false);
    } catch (err) {
      console.error("Unexpected error submitting report:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", className: "rounded-full h-14 w-14 p-0 shadow-lg", "aria-label": "Report incident", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-6 w-6" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md rounded-2xl max-h-[90dvh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-destructive" }),
          "Report Incident"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Select the type and severity, add a description, and we'll attach your GPS location." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-bold mb-2 block", children: "Incident Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: INCIDENT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setType(t.value),
              className: `p-3 rounded-xl border-2 text-left transition-all ${type === t.value ? "border-transparent shadow-md" : "border-border hover:border-primary/40 hover:bg-accent/20"}`,
              style: type === t.value ? {
                borderColor: INCIDENT_COLORS[t.value],
                backgroundColor: `${INCIDENT_COLORS[t.value]}12`
              } : void 0,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl", children: t.emoji }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mt-1", children: t.label })
              ]
            },
            t.value
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-bold mb-2 block", children: "Severity Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-1.5", children: SEVERITY_LEVELS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setSeverity(s.value),
              className: `p-2.5 rounded-xl border-2 text-center transition-all ${severity === s.value ? "text-white border-transparent shadow-md" : "border-border hover:border-primary/40 bg-card"}`,
              style: severity === s.value ? {
                backgroundColor: s.color,
                borderColor: s.color
              } : void 0,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base", children: s.emoji }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold mt-0.5 uppercase tracking-wider", children: s.label })
              ]
            },
            s.value
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-bold mb-2 block", children: "Description (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: desc,
              onChange: (e) => setDesc(e.target.value),
              maxLength: 500,
              placeholder: "What happened? Keep it factual and helpful.",
              className: "rounded-xl min-h-[80px]"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-[10px] text-muted-foreground mt-1", children: [
            desc.length,
            "/500"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-bold mb-2 block", children: "Photo or Video (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "file",
                accept: "image/*,video/*",
                capture: "environment",
                id: "media-capture",
                className: "hidden",
                onChange: (e) => {
                  if (e.target.files && e.target.files[0]) {
                    setMedia(e.target.files[0]);
                  }
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "label",
              {
                htmlFor: "media-capture",
                className: "cursor-pointer flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl h-12 px-4 text-sm font-medium hover:border-primary/40 hover:bg-accent/50 transition",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[200px]", children: media ? media.name : "Capture Photo / Video" })
                ]
              }
            ),
            media && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "shrink-0 h-12 w-12 rounded-xl text-destructive hover:bg-destructive/10",
                onClick: () => setMedia(null),
                "aria-label": "Remove media",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-accent/20 p-3 rounded-xl border border-border/50 flex items-center gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPinIcon, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Location: ",
            lat.toFixed(4),
            ", ",
            lng.toFixed(4)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, disabled: submitting, className: "w-full rounded-xl h-12 text-base font-bold", children: submitting ? "Submitting…" : "Submit Report" })
      ] })
    ] })
  ] });
}
function MapPinIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "10", r: "3" })
  ] });
}
function PingButton({ lat, lng, userId }) {
  const [sending, setSending] = reactExports.useState(false);
  const sendPing = async () => {
    if (!userId) {
      toast.error("Sign in to send a ping");
      return;
    }
    if (!confirm("Send an URGENT ping for your location? Only use for real immediate danger.")) return;
    setSending(true);
    const { error } = await supabase.from("pings").insert({
      reporter_id: userId,
      latitude: lat,
      longitude: lng,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString()
    });
    setSending(false);
    if (error) {
      toast.error(error.message.includes("rate limit") ? "Limit: 3 pings per hour" : error.message);
      return;
    }
    toast.success("🚨 Ping sent — nearby users alerted");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Button,
    {
      onClick: sendPing,
      disabled: sending,
      className: "w-full h-14 rounded-2xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-base font-bold shadow-[var(--shadow-ping)]",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Siren, { className: "h-5 w-5 mr-2" }),
        sending ? "Sending…" : "Send Ping Alert"
      ]
    }
  );
}
function Filters({
  radius,
  setRadius,
  windowH,
  setWindowH,
  types,
  setTypes,
  severities,
  setSeverities,
  statuses,
  setStatuses,
  alertRadius,
  setAlertRadius
}) {
  const toggleSet = (set, value, setter) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(FilterSection, { title: "Map Radius", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5 flex-wrap", children: RADIUS_PRESETS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Chip,
      {
        label: r.label,
        active: radius === r.value,
        onClick: () => setRadius(r.value)
      },
      r.value
    )) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FilterSection, { title: "Time Window", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5", children: TIME_WINDOWS.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Chip,
      {
        label: w.label,
        active: windowH === w.value,
        onClick: () => setWindowH(w.value)
      },
      w.value
    )) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FilterSection, { title: "Type", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5 flex-wrap", children: INCIDENT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Chip,
      {
        label: `${t.emoji} ${t.label}`,
        active: types.has(t.value),
        onClick: () => toggleSet(types, t.value, setTypes)
      },
      t.value
    )) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FilterSection, { title: "Severity", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5 flex-wrap", children: SEVERITY_LEVELS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Chip,
      {
        label: `${s.emoji} ${s.label}`,
        active: severities.has(s.value),
        onClick: () => toggleSet(severities, s.value, setSeverities),
        activeColor: s.color
      },
      s.value
    )) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FilterSection, { title: "Status", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5 flex-wrap", children: STATUS_OPTIONS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Chip,
      {
        label: `${s.emoji} ${s.label}`,
        active: statuses.has(s.value),
        onClick: () => toggleSet(statuses, s.value, setStatuses)
      },
      s.value
    )) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(FilterSection, { title: "Proximity Alert Radius", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5", children: ALERT_RADIUS_PRESETS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Chip,
        {
          label: r.label,
          active: alertRadius === r.value,
          onClick: () => setAlertRadius(r.value),
          activeColor: "#ef4444"
        },
        r.value
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-1.5", children: "Get notified when incidents are reported within this distance" })
    ] })
  ] });
}
function FilterSection({ title, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-muted-foreground uppercase mb-1.5 tracking-wider", children: title }),
    children
  ] });
}
function Chip({
  label,
  active,
  onClick,
  activeColor
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      onClick,
      className: `px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${active ? "text-white border-transparent shadow-sm" : "bg-card border-border hover:border-primary/40 hover:bg-accent/30"}`,
      style: active ? { backgroundColor: activeColor || "var(--primary)", borderColor: activeColor || "var(--primary)" } : void 0,
      children: label
    }
  );
}
function FeedView({ reports, userPos, onSelectReport, filterTypes, filterSeverities, filterStatuses }) {
  const [tab, setTab] = reactExports.useState("all");
  const [prevCount, setPrevCount] = reactExports.useState(reports.length);
  const [newIds, setNewIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const timerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (reports.length > prevCount) {
      const existingIds = new Set(reports.slice(reports.length - prevCount).map((r) => r.id));
      const fresh = reports.filter((r) => !existingIds.has(r.id)).map((r) => r.id);
      if (fresh.length > 0) {
        setNewIds((prev) => {
          const next = new Set(prev);
          fresh.forEach((id) => next.add(id));
          return next;
        });
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setNewIds(/* @__PURE__ */ new Set()), 4e3);
      }
    }
    setPrevCount(reports.length);
  }, [reports.length, prevCount, reports]);
  const filteredReports = reactExports.useMemo(() => {
    return reports.filter((r) => {
      if (filterTypes && filterTypes.size > 0 && !filterTypes.has(r.incident_type)) return false;
      if (filterSeverities && filterSeverities.size > 0 && !filterSeverities.has(r.severity)) return false;
      if (filterStatuses && filterStatuses.size > 0 && !filterStatuses.has(r.status)) return false;
      return true;
    });
  }, [reports, filterTypes, filterSeverities, filterStatuses]);
  const sortedReports = reactExports.useMemo(() => {
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
  const nearCount = userPos ? filteredReports.filter((r) => distanceMeters(userPos, { lat: r.latitude, lng: r.longitude }) <= 1e4).length : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full bg-background rounded-t-3xl overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 pb-3 border-b border-border shrink-0 bg-card/80 backdrop-blur-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-1.5 bg-muted rounded-full mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: tab, onValueChange: (v) => setTab(v), className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-2 rounded-xl h-11", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "all", className: "rounded-lg font-bold text-sm gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3.5 w-3.5" }),
          "Live Feed",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 bg-primary/15 text-primary text-[10px] font-black px-1.5 py-0.5 rounded-full", children: allCount })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "near", className: "rounded-lg font-bold text-sm gap-1.5", disabled: !userPos, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { className: "h-3.5 w-3.5" }),
          "Near Me",
          userPos && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 bg-destructive/15 text-destructive text-[10px] font-black px-1.5 py-0.5 rounded-full", children: nearCount })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-4 space-y-3 pb-24", children: sortedReports.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center space-y-3", children: tab === "near" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-12 w-12 opacity-20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-lg", children: "No incidents near you" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Stay safe! 🛡️ Your area is clear." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-12 w-12 opacity-20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-lg", children: "No active incidents" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "The community feed is quiet right now." })
    ] }) }) : sortedReports.map((r, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      IncidentCard,
      {
        report: r,
        userPos,
        onSelect: onSelectReport,
        isNearTab: tab === "near",
        isNew: newIds.has(r.id) || isRecentReport(r.created_at, 3),
        index: idx
      },
      r.id
    )) })
  ] });
}
function IncidentCard({
  report: r,
  userPos,
  onSelect,
  isNearTab,
  isNew,
  index: index2
}) {
  const dist = userPos ? distanceMeters(userPos, { lat: r.latitude, lng: r.longitude }) : null;
  const bearing = userPos ? getBearingDirection(userPos, { lat: r.latitude, lng: r.longitude }) : "";
  const distStr = dist !== null ? formatDistance(dist) : "";
  const score = r.confirmations_count - r.flags_count;
  const emoji = INCIDENT_ICONS[r.incident_type] || INCIDENT_ICONS.other;
  const urgency = dist !== null ? urgencyBadge(getUrgencyScore(r.severity, r.created_at, dist)) : urgencyBadge(getUrgencyScore(r.severity, r.created_at));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick: () => onSelect(r),
      className: `w-full text-left bg-card p-4 rounded-2xl border border-border shadow-sm hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.98] group flex gap-3 items-start ${isNew ? "feed-slide-in feed-new-item" : ""}`,
      style: isNew ? { animationDelay: `${index2 * 50}ms` } : void 0,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg shadow-sm",
            style: { backgroundColor: `${INCIDENT_COLORS[r.incident_type] || INCIDENT_COLORS.other}18`, border: `2px solid ${INCIDENT_COLORS[r.incident_type] || INCIDENT_COLORS.other}40` },
            children: emoji
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-1 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5 flex-wrap items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold capitalize text-sm", children: r.incident_type }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white",
                  style: { backgroundColor: SEVERITY_COLORS[r.severity] },
                  children: r.severity
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white flex items-center gap-0.5",
                  style: { backgroundColor: STATUS_COLORS[r.status] },
                  children: [
                    STATUS_ICONS[r.status],
                    " ",
                    r.status.replace("_", " ")
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground flex items-center gap-1 shrink-0 whitespace-nowrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
              " ",
              formatDistanceToNow(new Date(r.created_at))
            ] })
          ] }),
          r.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground line-clamp-2 mb-2 leading-snug", children: r.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-2 pt-2 border-t border-border/50 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs font-semibold min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5 text-primary shrink-0" }),
              distStr ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
                isNearTab ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: distStr }) : distStr,
                bearing && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground ml-1", children: bearing })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Location hidden" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
              isNearTab && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${urgency.label === "CRITICAL" ? "badge-urgent" : ""}`,
                  style: { backgroundColor: urgency.bg, color: urgency.color },
                  children: urgency.label
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-bold px-2 py-1 bg-accent rounded-lg flex gap-1 items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: "Score" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: score > 0 ? "text-primary" : score < 0 ? "text-destructive" : "", children: [
                  score > 0 ? "+" : "",
                  score
                ] })
              ] })
            ] })
          ] })
        ] })
      ]
    }
  );
}
function useComments(reportId) {
  const [comments, setComments] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!reportId) {
      setComments([]);
      return;
    }
    let mounted = true;
    setLoading(true);
    const load = async () => {
      const { data } = await supabase.from("comments").select("*, profiles(display_name)").eq("report_id", reportId).order("created_at", { ascending: true });
      if (!mounted) return;
      if (data) setComments(data);
      setLoading(false);
    };
    load();
    const ch = supabase.channel(`comments-${reportId}`).on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "comments", filter: `report_id=eq.${reportId}` },
      async (payload) => {
        const { data } = await supabase.from("profiles").select("display_name").eq("id", payload.new.user_id).single();
        const newComment = {
          ...payload.new,
          profiles: data || { display_name: "Anonymous" }
        };
        setComments((prev) => [...prev, newComment]);
      }
    ).subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, [reportId]);
  return { comments, loading };
}
function IncidentDetails({ report, onClose, userPos, currentUserId, onVoteReport }) {
  const { comments, loading } = useComments(report?.id || null);
  const [newComment, setNewComment] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [mediaExpanded, setMediaExpanded] = reactExports.useState(false);
  const miniMapRef = reactExports.useRef(null);
  const miniMapInstance = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!report || !miniMapRef.current) return;
    if (miniMapInstance.current) {
      miniMapInstance.current.remove();
      miniMapInstance.current = null;
    }
    const timer = setTimeout(async () => {
      if (!miniMapRef.current) return;
      const L = (await import("../_libs/leaflet.mjs").then(function(n) {
        return n.l;
      })).default;
      const map = L.map(miniMapRef.current, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        attributionControl: false
      }).setView([report.latitude, report.longitude], 16);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
      }).addTo(map);
      const color = report.status === "resolved" ? STATUS_COLORS.resolved : INCIDENT_COLORS[report.incident_type] || INCIDENT_COLORS.other;
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
          iconAnchor: [20, 20]
        })
      }).addTo(map);
      L.circle([report.latitude, report.longitude], {
        radius: 50,
        color,
        weight: 1,
        fillColor: color,
        fillOpacity: 0.1,
        dashArray: "4 4"
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
  const confirmPct = totalVotes > 0 ? report.confirmations_count / totalVotes * 100 : 50;
  const urgency = userPos ? urgencyBadge(getUrgencyScore(report.severity, report.created_at, dist)) : urgencyBadge(getUrgencyScore(report.severity, report.created_at));
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
      content: newComment.trim()
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      setNewComment("");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!report, onOpenChange: (open) => !open && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md h-[92dvh] sm:h-[88vh] p-0 flex flex-col rounded-t-[32px] sm:rounded-2xl overflow-hidden gap-0 bg-background border-border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-52 shrink-0 bg-accent/30 overflow-hidden", children: [
      report.image_url ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        isVideo ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "video",
          {
            src: report.image_url,
            controls: true,
            className: "w-full h-full object-cover",
            playsInline: true
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: report.image_url,
            alt: `${report.incident_type} incident`,
            className: "w-full h-full object-cover cursor-pointer",
            onClick: () => setMediaExpanded(true)
          }
        ),
        !isVideo && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setMediaExpanded(true),
            className: "absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "h-4 w-4" })
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center text-muted-foreground/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-16 w-16" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5 mb-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white shadow-sm", style: { backgroundColor: incidentColor }, children: [
              INCIDENT_ICONS[report.incident_type],
              " ",
              report.incident_type
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white shadow-sm", style: { backgroundColor: sevColor }, children: SEVERITY_LABELS[report.severity] || report.severity }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white shadow-sm", style: { backgroundColor: statusColor }, children: [
              STATUS_ICONS[report.status],
              " ",
              STATUS_LABELS[report.status]
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold text-white capitalize drop-shadow-md", children: [
            report.incident_type,
            " Incident"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 ${urgency.label === "CRITICAL" ? "badge-urgent" : ""}`,
            style: { backgroundColor: urgency.bg, color: urgency.color },
            children: urgency.label
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-between items-start text-sm gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            formatDistanceToNow(new Date(report.created_at)),
            " ago"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground/60", children: [
            "(",
            format(new Date(report.created_at), "MMM d, h:mm a"),
            ")"
          ] })
        ] }),
        userPos && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { className: "h-4 w-4 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: distStr }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: bearing })
        ] })
      ] }) }),
      report.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-bold mb-1.5 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-primary" }),
          " Description"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/90 bg-accent/20 p-3.5 rounded-xl border border-border/50 leading-relaxed", children: report.description })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-bold mb-1.5 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-primary" }),
          " Location"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mini-map-container", style: { height: 180 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: miniMapRef, style: { height: "100%", width: "100%" } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground mt-1.5", children: [
          report.latitude.toFixed(5),
          ", ",
          report.longitude.toFixed(5)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-bold mb-2 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-primary" }),
          " Timeline"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative pl-6 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-[9px] top-1 bottom-1 w-0.5 bg-border" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TimelineItem,
            {
              color: incidentColor,
              title: "Incident Reported",
              time: format(new Date(report.created_at), "MMM d, yyyy · h:mm a"),
              active: true
            }
          ),
          totalVotes > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            TimelineItem,
            {
              color: "#3b82f6",
              title: `${totalVotes} community vote${totalVotes !== 1 ? "s" : ""}`,
              time: `${report.confirmations_count} confirmed · ${report.flags_count} flagged`,
              active: true
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TimelineItem,
            {
              color: statusColor,
              title: `Status: ${STATUS_LABELS[report.status]}`,
              time: report.status === "active" ? "Monitoring" : "Updated",
              active: report.status === "active"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/40 p-4 rounded-2xl border border-border/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold", children: "Credibility Score" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xl font-black ${score > 0 ? "text-primary" : score < 0 ? "text-destructive" : "text-muted-foreground"}`, children: [
            score > 0 ? "+" : "",
            score
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "👍 ",
              report.confirmations_count,
              " confirmed"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "👎 ",
              report.flags_count,
              " flagged"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "vote-bar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "vote-bar-fill",
              style: {
                width: `${confirmPct}%`,
                background: `linear-gradient(90deg, #10b981, ${confirmPct > 70 ? "#10b981" : confirmPct > 30 ? "#f59e0b" : "#ef4444"})`
              }
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: () => onVoteReport(report.id, "confirm"),
              variant: "outline",
              className: "flex-1 bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors gap-1.5",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { className: "h-4 w-4" }),
                "Upvote"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: () => onVoteReport(report.id, "flag"),
              variant: "outline",
              className: "flex-1 bg-background hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors gap-1.5",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsDown, { className: "h-4 w-4" }),
                "Debunk"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-bold mb-3 flex items-center gap-2", children: [
          "Community Updates",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-black", children: comments.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5 mb-4", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-accent/20 rounded-xl p-3 border border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-24 bg-muted rounded shimmer mb-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-full bg-muted rounded shimmer" })
        ] }, i)) }) : comments.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-sm text-muted-foreground py-6 bg-accent/20 rounded-xl border border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-5 w-5 mx-auto mb-1 opacity-40" }),
          "No updates yet. Be the first to add context."
        ] }) : comments.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-3.5 rounded-xl border border-border shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-primary", children: c.profiles?.display_name ? formatPrivacyName(c.profiles.display_name) : "Anonymous" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
              formatDistanceToNow(new Date(c.created_at)),
              " ago"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed", children: c.content })
        ] }, c.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              placeholder: currentUserId ? "Add an update or context..." : "Sign in to comment",
              className: "min-h-[60px] resize-none pr-12 rounded-xl",
              value: newComment,
              onChange: (e) => setNewComment(e.target.value),
              disabled: !currentUserId || submitting,
              onKeyDown: (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitComment();
                }
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "icon",
              className: "absolute right-2 bottom-2 h-8 w-8 rounded-lg",
              disabled: !currentUserId || submitting || !newComment.trim(),
              onClick: submitComment,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" })
            }
          )
        ] })
      ] })
    ] }) }),
    mediaExpanded && report.image_url && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4",
        onClick: () => setMediaExpanded(false),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "absolute top-4 right-4 text-white/80 hover:text-white p-2",
              onClick: () => setMediaExpanded(false),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-6 w-6" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: report.image_url,
              alt: "Incident media",
              className: "max-w-full max-h-full object-contain rounded-lg"
            }
          )
        ]
      }
    )
  ] }) });
}
function TimelineItem({
  color,
  title,
  time,
  active
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex gap-3 items-start", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `w-[18px] h-[18px] rounded-full border-[3px] border-white shrink-0 -ml-6 z-10 shadow-sm ${active ? "" : "opacity-50"}`,
        style: { backgroundColor: color }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm font-semibold ${active ? "text-foreground" : "text-muted-foreground"}`, children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: time })
    ] })
  ] });
}
function formatPrivacyName(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}
const SafetyMap = reactExports.lazy(() => import("./SafetyMap-SBYwkmVq.mjs"));
function Index() {
  const {
    position,
    isFallback
  } = useGeolocation();
  const {
    user,
    isAnonymous
  } = useAuth();
  const {
    reports,
    pings
  } = useLiveData();
  const [radius, setRadius] = reactExports.useState(1e3);
  const [windowH, setWindowH] = reactExports.useState(72);
  const [types, setTypes] = reactExports.useState(new Set(INCIDENT_TYPES.map((t) => t.value)));
  const [severities, setSeverities] = reactExports.useState(new Set(SEVERITY_LEVELS.map((s) => s.value)));
  const [statuses, setStatuses] = reactExports.useState(/* @__PURE__ */ new Set(["active"]));
  const [alertRadius, setAlertRadius] = reactExports.useState(5e3);
  const [sheetOpen, setSheetOpen] = reactExports.useState(false);
  const [feedOpen, setFeedOpen] = reactExports.useState(false);
  const [alertedPings, setAlertedPings] = reactExports.useState(/* @__PURE__ */ new Set());
  const [selectedReport, setSelectedReport] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const handleNewReport = (e) => {
      const customEvent = e;
      const r = customEvent.detail;
      if (!position) return;
      const d = distanceMeters(position, {
        lat: r.latitude,
        lng: r.longitude
      });
      if (d <= alertRadius) {
        const direction = getBearingDirection(position, {
          lat: r.latitude,
          lng: r.longitude
        });
        SEVERITY_COLORS[r.severity] || SEVERITY_COLORS.medium;
        toast.error(`⚠️ New ${r.severity.toUpperCase()} incident — ${formatDistance(d)} ${direction}`, {
          description: `${r.incident_type}${r.description ? `: ${r.description.slice(0, 80)}` : ""}`,
          duration: 12e3,
          action: {
            label: "View Details",
            onClick: () => setSelectedReport(r)
          }
        });
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("⚠️ Nigeria Safety: Nearby Incident", {
            body: `${r.severity.toUpperCase()} ${r.incident_type} reported ${formatDistance(d)} ${direction} from you.`,
            tag: `incident-${r.id}`
          });
        }
        window.dispatchEvent(new CustomEvent("pulse-marker", {
          detail: r.id
        }));
      }
    };
    window.addEventListener("new-report-alert", handleNewReport);
    return () => window.removeEventListener("new-report-alert", handleNewReport);
  }, [position, alertRadius]);
  const visibleReports = reactExports.useMemo(() => {
    if (!position) return [];
    const cutoff = Date.now() - windowH * 60 * 60 * 1e3;
    return reports.filter((r) => {
      if (!types.has(r.incident_type)) return false;
      if (!severities.has(r.severity)) return false;
      if (!statuses.has(r.status)) return false;
      if (new Date(r.created_at).getTime() < cutoff) return false;
      return distanceMeters(position, {
        lat: r.latitude,
        lng: r.longitude
      }) <= radius;
    });
  }, [reports, position, radius, windowH, types, severities, statuses]);
  const stats = reactExports.useMemo(() => {
    if (!position) return {
      area: "Locating…",
      level: "safe",
      near: 0,
      pings: 0,
      verifiedPct: 0,
      critical: 0
    };
    const near = visibleReports.length;
    const verified = visibleReports.filter((r) => r.confirmations_count > 0).length;
    const critical = visibleReports.filter((r) => r.severity === "critical" || r.severity === "high").length;
    const activePings = pings.filter((p) => distanceMeters(position, {
      lat: p.latitude,
      lng: p.longitude
    }) <= 500).length;
    let level = "safe";
    if (activePings > 0 || critical > 0) level = "danger";
    else if (near >= 5) level = "warn";
    else if (near >= 2) level = "aware";
    return {
      area: isFallback ? "Lagos (default)" : "Your area",
      level,
      near,
      pings: activePings,
      verifiedPct: near ? Math.round(verified / near * 100) : 0,
      critical
    };
  }, [visibleReports, pings, position, isFallback]);
  reactExports.useEffect(() => {
    if (!position) return;
    pings.forEach((p) => {
      if (alertedPings.has(p.id)) return;
      const d = distanceMeters(position, {
        lat: p.latitude,
        lng: p.longitude
      });
      if (d <= 300) {
        toast.error(`🚨 URGENT ping ${formatDistance(d)} away`, {
          duration: 8e3
        });
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("🚨 Nigeria Safety: Urgent ping nearby", {
            body: `${formatDistance(d)} from you`,
            tag: `ping-${p.id}`
          });
        }
        setAlertedPings((prev) => new Set(prev).add(p.id));
      }
    });
  }, [pings, position, alertedPings]);
  reactExports.useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {
      });
    }
  }, []);
  const voteReport = async (id, kind) => {
    if (!user || isAnonymous) return toast.error("Sign in to vote on incidents");
    const {
      error
    } = await supabase.from("confirmations").insert({
      user_id: user.id,
      report_id: id,
      kind
    });
    if (error) {
      const dup = error.message.toLowerCase().includes("duplicate") || error.code === "23505";
      toast.error(dup ? "You've already voted on this incident" : error.message);
    } else {
      toast.success(kind === "confirm" ? "👍 Upvoted — marked as credible" : "👎 Debunked — flagged as inaccurate");
    }
  };
  const confirmPing = async (id) => {
    if (!user || isAnonymous) return toast.error("Sign in to confirm");
    const {
      error
    } = await supabase.from("confirmations").insert({
      user_id: user.id,
      ping_id: id,
      kind: "confirm"
    });
    if (error) {
      const dup = error.message.toLowerCase().includes("duplicate") || error.code === "23505";
      toast.error(dup ? "Already confirmed" : error.message);
    } else toast.success("Confirmed — ping extended");
  };
  const levelStyles = {
    safe: {
      dot: "bg-[var(--safe)]",
      text: "text-[var(--safe)]",
      label: "Safe Zone"
    },
    aware: {
      dot: "bg-[var(--aware)]",
      text: "text-[var(--aware)]",
      label: "Stay Aware"
    },
    warn: {
      dot: "bg-[var(--warn)]",
      text: "text-[var(--warn)]",
      label: "Elevated Risk"
    },
    danger: {
      dot: "bg-destructive",
      text: "text-destructive",
      label: "Active Alert"
    }
  };
  const ls = levelStyles[stats.level];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-[100dvh] w-full overflow-hidden bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-center", richColors: true, closeButton: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "fixed top-0 inset-x-0 z-[600] p-3 pt-[max(0.75rem,env(safe-area-inset-top))]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card/95 backdrop-blur-xl rounded-2xl shadow-[var(--shadow-soft)] border border-border px-4 py-3 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-2 w-2 rounded-full ${ls.dot} animate-pulse` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: ls.text, children: ls.label })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-lg font-bold flex items-center gap-1 mt-0.5 truncate", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-primary shrink-0" }),
          stats.area
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right hidden sm:block", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] uppercase text-muted-foreground tracking-wider flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-3 w-3" }),
          "Alert: ",
          alertRadius >= 1e3 ? `${alertRadius / 1e3}km` : `${alertRadius}m`
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black leading-none", children: stats.near }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase text-muted-foreground tracking-wider", children: "In radius" })
        ] }),
        user && !isAnonymous ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: async () => {
          await supabase.auth.signOut();
          toast.success("Signed out");
        }, title: "Sign out", className: "h-10 w-10 rounded-full bg-secondary hover:bg-accent flex items-center justify-center transition-colors", "aria-label": "Sign out", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/auth", title: "Sign in", className: "h-10 px-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 text-xs font-bold transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "h-4 w-4" }),
          "Sign in"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "absolute inset-0", children: position ? /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full flex items-center justify-center text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Loading map…" })
    ] }) }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SafetyMap, { user: position, radius, reports: visibleReports, pings, onVoteReport: voteReport, onConfirmPing: confirmPing, onSelectReport: setSelectedReport }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full flex items-center justify-center text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-10 w-10 mx-auto mb-2 text-primary animate-pulse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Getting your location…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: "Please allow location access for accurate results." })
    ] }) }) }),
    position && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed right-5 bottom-[calc(12rem+env(safe-area-inset-bottom))] z-[2600] pointer-events-auto", children: user && !isAnonymous ? /* @__PURE__ */ jsxRuntimeExports.jsx(ReportDialog, { lat: position.lat, lng: position.lng, userId: user.id }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", "aria-label": "Sign in to report", title: "Sign in to report an incident", className: "h-14 w-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center shadow-lg transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "h-6 w-6" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute inset-x-0 bottom-0 z-[450] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${feedOpen ? "translate-y-0 h-[85dvh]" : "translate-y-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] p-3 pointer-events-none"}`, children: feedOpen ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full pointer-events-auto relative shadow-[0_-10px_40px_rgb(0,0,0,0.2)] rounded-t-3xl bg-background flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFeedOpen(false), className: "absolute -top-14 right-4 bg-card p-3 rounded-full shadow-lg border border-border flex items-center justify-center text-primary hover:bg-accent transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FeedView, { reports, userPos: position, onSelectReport: setSelectedReport, filterTypes: types, filterSeverities: severities, filterStatuses: statuses })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative bg-card rounded-3xl shadow-[var(--shadow-soft)] border border-border p-4 space-y-3 pointer-events-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { value: stats.pings, label: "Pings", tone: "danger" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { value: stats.near, label: `${windowH}h`, tone: "warn" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { value: stats.critical, label: "Urgent", tone: "danger" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { value: `${stats.verifiedPct}%`, label: "Verified", tone: "primary" })
      ] }),
      position && (user && !isAnonymous ? /* @__PURE__ */ jsxRuntimeExports.jsx(PingButton, { lat: position.lat, lng: position.lng, userId: user.id }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/auth", className: "w-full h-14 rounded-2xl bg-destructive/90 hover:bg-destructive text-destructive-foreground text-base font-bold shadow-[var(--shadow-ping)] flex items-center justify-center gap-2 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "h-5 w-5" }),
        "Sign in to send Ping Alert"
      ] })),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSheetOpen((v) => !v), className: "w-full flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground py-1 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: `h-4 w-4 transition ${sheetOpen ? "rotate-180" : ""}` }),
        sheetOpen ? "Hide filters" : "Filters & settings"
      ] }),
      sheetOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t border-border space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Filters, { radius, setRadius, windowH, setWindowH, types, setTypes, severities, setSeverities, statuses, setStatuses, alertRadius, setAlertRadius }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 text-[11px] flex-wrap pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { color: "var(--danger)", label: "≤100m Immediate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { color: "var(--warn)", label: "≤300m Nearby" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { color: "var(--aware)", label: "≤500m Aware" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { color: "var(--safe)", label: ">500m Safe" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setFeedOpen(true), variant: "secondary", className: "w-full h-12 rounded-xl flex gap-2 font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "h-5 w-5" }),
        "View Live Feed & Near Me"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(IncidentDetails, { report: selectedReport, onClose: () => setSelectedReport(null), userPos: position, currentUserId: user?.id, onVoteReport: voteReport })
  ] });
}
function Stat({
  value,
  label,
  tone
}) {
  const colors = {
    danger: "text-destructive",
    warn: "text-[var(--warn)]",
    primary: "text-primary"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/60 rounded-xl px-2 py-2 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-xl font-black leading-none ${colors[tone]}`, children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase text-muted-foreground tracking-wider mt-1", children: label })
  ] });
}
function Legend({
  color,
  label
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-full", style: {
      background: color
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: label })
  ] });
}
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  component: Index
}, Symbol.toStringTag, { value: "Module" }));
export {
  HEAT_COLORS as H,
  INCIDENT_COLORS as I,
  SEVERITY_COLORS as S,
  STATUS_COLORS as a,
  INCIDENT_ICONS as b,
  index as c,
  distanceMeters as d,
  formatDistance as f,
  isRecentReport as i
};
