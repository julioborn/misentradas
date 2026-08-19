"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LocateFixed, X } from "lucide-react";

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
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

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
    const params = new URLSearchParams();
    if (nextProvincia) params.set("provincia", nextProvincia);
    if (nextLocalidad) params.set("localidad", nextLocalidad);
    router.push(params.toString() ? `/?${params.toString()}` : "/");
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setNotice("Tu navegador no soporta geolocalización.");
      return;
    }

    setLocating(true);
    setNotice(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `/api/georef/ubicacion?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          );
          const data = await res.json();
          const prov = data.ubicacion?.provincia?.nombre ?? "";
          const muni = data.ubicacion?.municipio?.nombre ?? "";

          if (!prov) {
            setNotice("No pudimos determinar tu provincia.");
            return;
          }

          setProvincia(prov);
          setLocalidad("");
          applyFilter(prov, "");
          setNotice(
            muni
              ? `Te ubicamos cerca de ${muni}, ${prov}. Elegí tu localidad exacta si hace falta.`
              : `Te ubicamos en ${prov}. Elegí tu localidad si hace falta.`
          );
        } catch {
          setNotice("No pudimos determinar tu ubicación.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setNotice("No pudimos acceder a tu ubicación.");
        setLocating(false);
      }
    );
  }

  function handleClear() {
    setProvincia("");
    setLocalidad("");
    setLocalidades([]);
    setNotice(null);
    applyFilter("", "");
  }

  const hasFilter = Boolean(currentProvincia || currentLocalidad);

  return (
    <div className="mb-6 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleUseLocation}
          disabled={locating}
          className="flex items-center gap-1.5 text-xs font-medium text-violet border border-violet/30 rounded-full px-3 py-1.5 disabled:opacity-50"
        >
          <LocateFixed className="size-3.5" />
          {locating ? "Buscando..." : "Usar mi ubicación"}
        </button>
        {hasFilter && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-haze"
          >
            <X className="size-3.5" />
            Limpiar
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select
          value={provincia}
          onChange={(e) => {
            const value = e.target.value;
            setProvincia(value);
            setLocalidad("");
            if (!value) setLocalidades([]);
            applyFilter(value, "");
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

      {notice && <p className="text-xs text-haze">{notice}</p>}
    </div>
  );
}
