import {
  LOCATION_COOKIE,
  parseLocationCookie,
  type LocationPreference,
} from "@/lib/location-preference";

export function readLocationCookie(): LocationPreference | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCATION_COOKIE}=([^;]*)`)
  );
  return parseLocationCookie(match?.[1]);
}

export function writeLocationCookie(pref: LocationPreference) {
  const value = encodeURIComponent(JSON.stringify(pref));
  document.cookie = `${LOCATION_COOKIE}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

export function clearLocationCookie() {
  document.cookie = `${LOCATION_COOKIE}=; path=/; max-age=0`;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\x00-\x7F]/g, "")
    .trim();
}

export async function resolveLocationFromCoords(
  lat: number,
  lon: number
): Promise<LocationPreference | null> {
  const res = await fetch(`/api/georef/ubicacion?lat=${lat}&lon=${lon}`);
  if (!res.ok) return null;

  const data = await res.json();
  const provincia: string = data.ubicacion?.provincia?.nombre ?? "";
  if (!provincia) return null;

  const municipio: string = data.ubicacion?.municipio?.nombre ?? "";
  const departamento: string = data.ubicacion?.departamento?.nombre ?? "";
  const targets = [municipio, departamento].filter(Boolean).map(normalize);

  let localidad = "";

  try {
    const locRes = await fetch(
      `/api/georef/localidades?provincia=${encodeURIComponent(provincia)}`
    );
    const locData = await locRes.json();
    const localidades: { nombre: string }[] = locData.localidades ?? [];

    for (const target of targets) {
      const exact = localidades.find((l) => normalize(l.nombre) === target);
      if (exact) {
        localidad = exact.nombre;
        break;
      }
    }

    if (!localidad) {
      for (const target of targets) {
        const partial = localidades.find(
          (l) =>
            normalize(l.nombre).includes(target) ||
            target.includes(normalize(l.nombre))
        );
        if (partial) {
          localidad = partial.nombre;
          break;
        }
      }
    }
  } catch {
    // best-effort match; provincia alone is still a usable filter
  }

  return { provincia, localidad };
}
