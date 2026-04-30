import {
  RADIUS_PRESETS,
  ALERT_RADIUS_PRESETS,
  TIME_WINDOWS,
  INCIDENT_TYPES,
  SEVERITY_LEVELS,
  STATUS_OPTIONS,
} from "@/lib/geo";

type Props = {
  radius: number;
  setRadius: (n: number) => void;
  windowH: number;
  setWindowH: (n: number) => void;
  types: Set<string>;
  setTypes: (s: Set<string>) => void;
  severities: Set<string>;
  setSeverities: (s: Set<string>) => void;
  statuses: Set<string>;
  setStatuses: (s: Set<string>) => void;
  alertRadius: number;
  setAlertRadius: (n: number) => void;
};

export function Filters({
  radius, setRadius,
  windowH, setWindowH,
  types, setTypes,
  severities, setSeverities,
  statuses, setStatuses,
  alertRadius, setAlertRadius,
}: Props) {
  const toggleSet = (set: Set<string>, value: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  return (
    <div className="space-y-4">
      {/* Map Radius */}
      <FilterSection title="Map Radius">
        <div className="flex gap-1.5 flex-wrap">
          {RADIUS_PRESETS.map((r) => (
            <Chip
              key={r.value}
              label={r.label}
              active={radius === r.value}
              onClick={() => setRadius(r.value)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Time Window */}
      <FilterSection title="Time Window">
        <div className="flex gap-1.5">
          {TIME_WINDOWS.map((w) => (
            <Chip
              key={w.value}
              label={w.label}
              active={windowH === w.value}
              onClick={() => setWindowH(w.value)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Incident Type */}
      <FilterSection title="Type">
        <div className="flex gap-1.5 flex-wrap">
          {INCIDENT_TYPES.map((t) => (
            <Chip
              key={t.value}
              label={`${t.emoji} ${t.label}`}
              active={types.has(t.value)}
              onClick={() => toggleSet(types, t.value, setTypes)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Severity */}
      <FilterSection title="Severity">
        <div className="flex gap-1.5 flex-wrap">
          {SEVERITY_LEVELS.map((s) => (
            <Chip
              key={s.value}
              label={`${s.emoji} ${s.label}`}
              active={severities.has(s.value)}
              onClick={() => toggleSet(severities, s.value, setSeverities)}
              activeColor={s.color}
            />
          ))}
        </div>
      </FilterSection>

      {/* Status */}
      <FilterSection title="Status">
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <Chip
              key={s.value}
              label={`${s.emoji} ${s.label}`}
              active={statuses.has(s.value)}
              onClick={() => toggleSet(statuses, s.value, setStatuses)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Alert Radius */}
      <FilterSection title="Proximity Alert Radius">
        <div className="flex gap-1.5">
          {ALERT_RADIUS_PRESETS.map((r) => (
            <Chip
              key={r.value}
              label={r.label}
              active={alertRadius === r.value}
              onClick={() => setAlertRadius(r.value)}
              activeColor="#ef4444"
            />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          Get notified when incidents are reported within this distance
        </p>
      </FilterSection>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 tracking-wider">{title}</div>
      {children}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
  activeColor,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  activeColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
        active
          ? "text-white border-transparent shadow-sm"
          : "bg-card border-border hover:border-primary/40 hover:bg-accent/30"
      }`}
      style={active ? { backgroundColor: activeColor || "var(--primary)", borderColor: activeColor || "var(--primary)" } : undefined}
    >
      {label}
    </button>
  );
}
