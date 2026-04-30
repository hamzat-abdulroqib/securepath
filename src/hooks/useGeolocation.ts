import { useEffect, useState } from "react";
import type { LatLng } from "@/lib/geo";

// Default location: Lagos, Nigeria — used until the browser returns GPS.
const FALLBACK: LatLng = { lat: 6.5244, lng: 3.3792 };

export function useGeolocation() {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
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
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { position, accuracy, error, isFallback };
}
