export const LOCATION_COOKIE = "me_loc";
export const LOCATION_PROMPTED_KEY = "me_loc_prompted";

export type LocationPreference = { provincia: string; localidad: string };

export function parseLocationCookie(
  raw: string | undefined | null
): LocationPreference | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (parsed && typeof parsed.provincia === "string" && parsed.provincia) {
      return {
        provincia: parsed.provincia,
        localidad: typeof parsed.localidad === "string" ? parsed.localidad : "",
      };
    }
  } catch {
    // malformed cookie, treat as unset
  }

  return null;
}
