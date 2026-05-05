import { Button } from "@/components/ui/button";
import { Siren } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export function PingButton({ lat, lng, userId }: { lat: number; lng: number; userId: string | null }) {
  const [sending, setSending] = useState(false);

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
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    });
    setSending(false);
    if (error) {
      toast.error(error.message.includes("rate limit") ? "Limit: 3 pings per hour" : error.message);
      return;
    }
    toast.success("🚨 Ping sent — nearby users alerted");
  };

  return (
    <Button
      onClick={sendPing}
      disabled={sending}
      className="w-full h-14 rounded-2xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-base font-bold shadow-[var(--shadow-ping)]"
    >
      <Siren className="h-5 w-5 mr-2" />
      {sending ? "Sending…" : "Send Ping Alert"}
    </Button>
  );
}
