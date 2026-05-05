import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Camera, X, AlertTriangle } from "lucide-react";
import { INCIDENT_TYPES, SEVERITY_LEVELS, INCIDENT_COLORS, type IncidentType } from "@/lib/geo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  incident_type: z.enum(["robbery", "theft", "suspicious", "assault", "accident", "fire", "other"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  description: z.string().trim().max(500).optional(),
});

export function ReportDialog({ lat, lng, userId }: { lat: number; lng: number; userId: string | null }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<IncidentType>("suspicious");
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [desc, setDesc] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

    let mediaUrl: string | null = null;
    if (media) {
      const fileExt = media.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('incident-media')
        .upload(fileName, media);

      if (uploadError) {
        // Don't block report submission — just skip the media
        console.warn("Media upload failed:", uploadError.message);
        toast.warning("Media upload failed — submitting report without image");
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('incident-media')
          .getPublicUrl(fileName);
        mediaUrl = publicUrlData.publicUrl;
      }
    }

    // Use RPC function to bypass PostgREST schema cache issues
    const { error } = await supabase.rpc('insert_report', {
      p_reporter_id: userId,
      p_incident_type: parsed.data.incident_type,
      p_severity: parsed.data.severity,
      p_description: parsed.data.description || null,
      p_latitude: lat,
      p_longitude: lng,
      p_image_url: mediaUrl,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Report submitted — community alerted");
    setDesc("");
    setMedia(null);
    setSeverity("medium");
    setType("suspicious");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full h-14 w-14 p-0 shadow-lg" aria-label="Report incident">
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report Incident
          </DialogTitle>
          <DialogDescription>
            Select the type and severity, add a description, and we'll attach your GPS location.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          {/* Incident Type */}
          <div>
            <label className="text-sm font-bold mb-2 block">Incident Type</label>
            <div className="grid grid-cols-2 gap-2">
              {INCIDENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    type === t.value
                      ? "border-transparent shadow-md"
                      : "border-border hover:border-primary/40 hover:bg-accent/20"
                  }`}
                  style={type === t.value ? {
                    borderColor: INCIDENT_COLORS[t.value],
                    backgroundColor: `${INCIDENT_COLORS[t.value]}12`,
                  } : undefined}
                >
                  <div className="text-xl">{t.emoji}</div>
                  <div className="text-sm font-medium mt-1">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Severity Level */}
          <div>
            <label className="text-sm font-bold mb-2 block">Severity Level</label>
            <div className="grid grid-cols-4 gap-1.5">
              {SEVERITY_LEVELS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSeverity(s.value as typeof severity)}
                  className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                    severity === s.value
                      ? "text-white border-transparent shadow-md"
                      : "border-border hover:border-primary/40 bg-card"
                  }`}
                  style={severity === s.value ? {
                    backgroundColor: s.color,
                    borderColor: s.color,
                  } : undefined}
                >
                  <div className="text-base">{s.emoji}</div>
                  <div className="text-[10px] font-bold mt-0.5 uppercase tracking-wider">{s.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-bold mb-2 block">Description (optional)</label>
            <Textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              maxLength={500}
              placeholder="What happened? Keep it factual and helpful."
              className="rounded-xl min-h-[80px]"
            />
            <div className="text-right text-[10px] text-muted-foreground mt-1">{desc.length}/500</div>
          </div>

          {/* Media */}
          <div>
            <label className="text-sm font-bold mb-2 block">Photo or Video (optional)</label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*,video/*"
                capture="environment"
                id="media-capture"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setMedia(e.target.files[0]);
                  }
                }}
              />
              <label
                htmlFor="media-capture"
                className="cursor-pointer flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl h-12 px-4 text-sm font-medium hover:border-primary/40 hover:bg-accent/50 transition"
              >
                <Camera className="h-4 w-4" />
                <span className="truncate max-w-[200px]">
                  {media ? media.name : "Capture Photo / Video"}
                </span>
              </label>
              {media && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-12 w-12 rounded-xl text-destructive hover:bg-destructive/10"
                  onClick={() => setMedia(null)}
                  aria-label="Remove media"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Location preview */}
          <div className="bg-accent/20 p-3 rounded-xl border border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPinIcon />
            <span>Location: {lat.toFixed(4)}, {lng.toFixed(4)}</span>
          </div>

          {/* Submit */}
          <Button onClick={submit} disabled={submitting} className="w-full rounded-xl h-12 text-base font-bold">
            {submitting ? "Submitting…" : "Submit Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MapPinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
