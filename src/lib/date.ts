const TIME_ZONE = "America/Argentina/Buenos_Aires";

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: TIME_ZONE,
  });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    dateStyle: "medium",
    timeZone: TIME_ZONE,
  });
}

const MONTH_ABBR = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
  "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
];

// Argentina wall-clock day/month for the small date-badge shown on event
// cards, independent of the server process's own timezone.
export function formatDayBadge(iso: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "numeric",
  }).formatToParts(new Date(iso));
  const day = parts.find((p) => p.type === "day")!.value;
  const month = Number(parts.find((p) => p.type === "month")!.value);
  return { day, month: MONTH_ABBR[month - 1] };
}

// "HOY" / "MAÑANA" when the event falls on those Argentina-local days,
// otherwise the weekday name so the badge stays informative further out.
export function formatRelativeLabel(iso: string) {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(d);
  const target = fmt(new Date(iso));
  const today = fmt(new Date());
  const tomorrow = fmt(new Date(Date.now() + 24 * 60 * 60 * 1000));

  if (target === today) return "Hoy";
  if (target === tomorrow) return "Mañana";
  return new Date(iso).toLocaleDateString("es-AR", {
    weekday: "long",
    timeZone: TIME_ZONE,
  });
}

export function formatDateTimeShort(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: TIME_ZONE,
  });
}

// Argentina has been fixed at UTC-3 with no DST since 2009, so this offset
// is always correct — no need to compute it dynamically.
const ART_OFFSET_MS = 3 * 60 * 60 * 1000;

// Converts a stored UTC ISO timestamp into the "YYYY-MM-DDTHH:mm" value a
// <input type="datetime-local"> expects, showing Argentina wall-clock time
// regardless of which timezone the server process itself runs in.
export function toDatetimeLocalValue(iso: string) {
  const d = new Date(new Date(iso).getTime() - ART_OFFSET_MS);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(
    d.getUTCDate()
  )}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

// Converts a <input type="datetime-local"> value (assumed to be Argentina
// wall-clock time) into a UTC ISO string for storage.
export function datetimeLocalValueToIso(value: string) {
  return new Date(`${value}:00-03:00`).toISOString();
}
