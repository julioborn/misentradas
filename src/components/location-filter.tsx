"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { clearLocationCookie, writeLocationCookie } from "@/lib/geo-client";
import { LOCATION_PROMPTED_KEY } from "@/lib/location-preference";

type GeoItem = { id: string; nombre: string };

export function LocationFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentProvincia = searchParams.get("provincia") ?? "";
  const currentLocalidad = searchParams.get("localidad") ?? "";

  const [provincias, setProvincias] = useState<GeoItem[]>([]);
  const [localidades, setLocalidades] = useState<GeoItem[]>([]);
  const [localidadesProvincia, setLocalidadesProvincia] = useState("");
  const [provincia, setProvincia] = useState(currentProvincia);
  const [localidad, setLocalidad] = useState(currentLocalidad);
  const loadingLocalidades = Boolean(provincia) && provincia !== localidadesProvincia;

  useEffect(() => {
    fetch("/api/georef/provincias")
      .then((r) => r.json())
      .then((d) => setProvincias(d.provincias ?? []))
      .catch(() => setProvincias([]));
  }, []);

  useEffect(() => {
    if (!provincia) {
      return;
    }

    fetch(`/api/georef/localidades?provincia=${encodeURIComponent(provincia)}`)
      .then((r) => r.json())
      .then((d) => {
        setLocalidades(d.localidades ?? []);
        setLocalidadesProvincia(provincia);
      })
      .catch(() => {
        setLocalidades([]);
        setLocalidadesProvincia(provincia);
      });
  }, [provincia]);

  function applyFilter(nextProvincia: string, nextLocalidad: string) {
    if (nextProvincia) {
      writeLocationCookie({ provincia: nextProvincia, localidad: nextLocalidad });
    }
    const params = new URLSearchParams();
    if (nextProvincia) params.set("provincia", nextProvincia);
    if (nextLocalidad) params.set("localidad", nextLocalidad);
    router.push(params.toString() ? `/?${params.toString()}` : "/");
  }

  function handleClear() {
    setProvincia("");
    setLocalidad("");
    setLocalidades([]);
    clearLocationCookie();
    // Let "¿Ver eventos cerca tuyo?" offer to activate the location again
    // next time, instead of staying dismissed forever.
    window.localStorage.removeItem(LOCATION_PROMPTED_KEY);
    router.push("/");
  }

  const hasFilter = Boolean(currentProvincia || currentLocalidad);

  return (
    <div className="mb-6 flex flex-col gap-2">
      {hasFilter && (
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-1 self-start text-xs text-haze"
        >
          <X className="size-3.5" />
          Limpiar ubicación
        </button>
      )}

      <div className="grid grid-cols-2 gap-2">
        <select
          value={provincia}
          onChange={(e) => {
            const value = e.target.value;
            setProvincia(value);
            setLocalidad("");
            if (!value) {
              handleClear();
            } else {
              setLocalidades([]);
              applyFilter(value, "");
            }
          }}
          className="rounded-lg bg-ink border border-white/10 px-3 py-2 text-sm text-paper focus:outline-none focus:ring-2 focus:ring-violet"
        >
          <option value="">Toda Argentina</option>
          {provincias.map((p) => (
            <option key={p.id} value={p.nombre}>
              {p.nombre}
            </option>
          ))}
        </select>
        <select
          value={localidad}
          onChange={(e) => {
            const value = e.target.value;
            setLocalidad(value);
            applyFilter(provincia, value);
          }}
          disabled={!provincia || loadingLocalidades}
          className="rounded-lg bg-ink border border-white/10 px-3 py-2 text-sm text-paper focus:outline-none focus:ring-2 focus:ring-violet disabled:opacity-50"
        >
          <option value="">
            {loadingLocalidades ? "Cargando..." : "Toda la provincia"}
          </option>
          {localidades.map((l) => (
            <option key={l.id} value={l.nombre}>
              {l.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
