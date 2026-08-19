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

export function formatDateTimeShort(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: TIME_ZONE,
  });
}
