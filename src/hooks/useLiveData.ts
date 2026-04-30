import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Report = {
  id: string;
  reporter_id: string;
  incident_type: string;
  description: string | null;
  latitude: number;
  longitude: number;
  image_url: string | null;
  confirmations_count: number;
  flags_count: number;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "resolved" | "false_alarm";
  created_at: string;
};

export type Ping = {
  id: string;
  reporter_id: string;
  latitude: number;
  longitude: number;
  confirmations_count: number;
  created_at: string;
  expires_at: string;
};

export function useLiveData() {
  const [reports, setReports] = useState<Report[]>([]);
  const [pings, setPings] = useState<Ping[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const [r, p] = await Promise.all([
        supabase.from("reports").select("*").gte("created_at", sevenDaysAgo).order("created_at", { ascending: false }).limit(500),
        supabase.from("pings").select("*").gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false }),
      ]);
      if (!mounted) return;
      if (r.data) setReports(r.data as Report[]);
      if (p.data) setPings(p.data as Ping[]);
      setLoading(false);
    };
    load();

    const ch = supabase
      .channel("safety-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, (payload) => {
        setReports((prev) => {
          if (payload.eventType === "INSERT") {
            const newReport = payload.new as Report;
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("new-report-alert", { detail: newReport }));
            }
            return [newReport, ...prev];
          }
          if (payload.eventType === "UPDATE")
            return prev.map((x) => (x.id === (payload.new as Report).id ? (payload.new as Report) : x));
          if (payload.eventType === "DELETE")
            return prev.filter((x) => x.id !== (payload.old as Report).id);
          return prev;
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "pings" }, (payload) => {
        setPings((prev) => {
          if (payload.eventType === "INSERT") return [payload.new as Ping, ...prev];
          if (payload.eventType === "UPDATE")
            return prev.map((x) => (x.id === (payload.new as Ping).id ? (payload.new as Ping) : x));
          if (payload.eventType === "DELETE")
            return prev.filter((x) => x.id !== (payload.old as Ping).id);
          return prev;
        });
      })
      .subscribe();

    // Tick every 30s to expire pings client-side.
    const tick = setInterval(() => {
      setPings((prev) => prev.filter((p) => new Date(p.expires_at).getTime() > Date.now()));
    }, 30_000);

    return () => {
      mounted = false;
      supabase.removeChannel(ch);
      clearInterval(tick);
    };
  }, []);

  return { reports, pings, loading };
}
