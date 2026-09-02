"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { clearLocationCookie, writeLocationCookie } from "@/lib/geo-client";
import { LOCATION_PROMPTED_KEY } from "@/lib/location-preference";

type GeoItem = { id: string; nombre: string };

export function LocationFilter({
  provinciasConEventos = [],
}: {
  provinciasConEventos?: string[];
}) {
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
    const params = new URLSearchParams(searchParams.toString());
    if (nextProvincia) params.set("provincia", nextProvincia);
    else params.delete("provincia");
    if (nextLocalidad) params.set("localidad", nextLocalidad);
    else params.delete("localidad");
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
    const params = new URLSearchParams(searchParams.toString());
    params.delete("provincia");
    params.delete("localidad");
    router.push(params.toString() ? `/?${params.toString()}` : "/");
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

      {provinciasConEventos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setProvincia("");
              setLocalidad("");
              applyFilter("", "");
            }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border ${
              !currentProvincia
                ? "bg-violet text-ink border-violet"
                : "border-white/10 text-haze"
            }`}
          >
            Todas
          </button>
          {provinciasConEventos.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setProvincia(p);
                setLocalidad("");
                setLocalidades([]);
                applyFilter(p, "");
              }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border ${
                currentProvincia === p && !currentLocalidad
                  ? "bg-violet text-ink border-violet"
                  : "border-white/10 text-haze"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
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
