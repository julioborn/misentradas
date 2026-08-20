"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, X } from "lucide-react";
import { resolveLocationFromCoords, writeLocationCookie } from "@/lib/geo-client";
import { LOCATION_PROMPTED_KEY } from "@/lib/location-preference";

export function LocationPrompt({
  hasSavedLocation,
}: {
  hasSavedLocation: boolean;
}) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (hasSavedLocation) return;
    Promise.resolve().then(() => {
      if (window.localStorage.getItem(LOCATION_PROMPTED_KEY)) return;
      setVisible(true);
    });
  }, [hasSavedLocation]);

  function dismiss() {
    window.localStorage.setItem(LOCATION_PROMPTED_KEY, "1");
    setVisible(false);
  }

  function handleActivate() {
    if (!navigator.geolocation) {
      setNotice("Tu navegador no soporta geolocalización.");
      return;
    }

    setLocating(true);
    setNotice(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const resolved = await resolveLocationFromCoords(
            pos.coords.latitude,
            pos.coords.longitude
          );

          if (!resolved) {
            setNotice("No pudimos determinar tu ubicación.");
            return;
          }

          writeLocationCookie(resolved);
          window.localStorage.setItem(LOCATION_PROMPTED_KEY, "1");
          setVisible(false);

          const params = new URLSearchParams();
          params.set("provincia", resolved.provincia);
          if (resolved.localidad) params.set("localidad", resolved.localidad);
          router.push(`/?${params.toString()}`);
        } catch {
          setNotice("No pudimos determinar tu ubicación.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setNotice("No pudimos acceder a tu ubicación.");
        setLocating(false);
        window.localStorage.setItem(LOCATION_PROMPTED_KEY, "1");
      }
    );
  }

  if (!visible) return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-violet/30 bg-violet/10 px-4 py-3">
      <MapPin className="size-5 text-violet shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-paper font-medium">
          ¿Ver los eventos más cerca tuyo?
        </p>
        <p className="text-xs text-haze mt-0.5">
          {notice ?? "Activá tu ubicación una vez y te la recordamos siempre."}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={handleActivate}
            disabled={locating}
            className="text-xs font-semibold text-ink bg-violet rounded-full px-3 py-1.5 disabled:opacity-50"
          >
            {locating ? "Ubicando..." : "Activar ubicación"}
          </button>
          <button type="button" onClick={dismiss} className="text-xs text-haze">
            Ahora no
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar"
        className="text-haze shrink-0"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
