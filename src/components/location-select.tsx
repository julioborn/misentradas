"use client";

import { useEffect, useState } from "react";

type GeoItem = { id: string; nombre: string };

export function LocationSelect({
  defaultProvincia,
  defaultLocalidad,
}: {
  defaultProvincia?: string | null;
  defaultLocalidad?: string | null;
}) {
  const [provincias, setProvincias] = useState<GeoItem[]>([]);
  const [localidades, setLocalidades] = useState<GeoItem[]>([]);
  const [localidadesProvincia, setLocalidadesProvincia] = useState("");
  const [provincia, setProvincia] = useState(defaultProvincia ?? "");
  const [localidad, setLocalidad] = useState(defaultLocalidad ?? "");
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

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="provincia" className="text-xs uppercase tracking-wide text-haze">
          Provincia
        </label>
        <select
          id="provincia"
          name="provincia"
          value={provincia}
          onChange={(e) => {
            setProvincia(e.target.value);
            setLocalidad("");
            setLocalidades([]);
          }}
          className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper focus:outline-none focus:ring-2 focus:ring-violet"
        >
          <option value="">Elegir</option>
          {provincias.map((p) => (
            <option key={p.id} value={p.nombre}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="localidad" className="text-xs uppercase tracking-wide text-haze">
          Localidad
        </label>
        <select
          id="localidad"
          name="localidad"
          value={localidad}
          onChange={(e) => setLocalidad(e.target.value)}
          disabled={!provincia || loadingLocalidades}
          className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper focus:outline-none focus:ring-2 focus:ring-violet disabled:opacity-50"
        >
          <option value="">
            {loadingLocalidades ? "Cargando..." : "Elegir"}
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
