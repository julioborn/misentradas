import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TicketStub } from "@/components/ticket-stub";
import { LocationFilter } from "@/components/location-filter";
import { LocationPrompt } from "@/components/location-prompt";
import { SortSelect } from "@/components/sort-select";
import { LOCATION_COOKIE, parseLocationCookie } from "@/lib/location-preference";
import { formatDateTime, formatDayBadge, formatRelativeLabel } from "@/lib/date";

type EventRow = {
  id: string;
  nombre: string;
  fecha: string;
  lugar: string | null;
  provincia: string | null;
  localidad: string | null;
  precio: number;
  imagen_url: string | null;
  organizer_id: string;
};

const EVENT_COLUMNS =
  "id, nombre, fecha, lugar, provincia, localidad, precio, imagen_url, organizer_id";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ provincia?: string; localidad?: string; sort?: string }>;
}) {
  const { provincia, localidad, sort } = await searchParams;
  const cookieStore = await cookies();
  const savedLocation = parseLocationCookie(
    cookieStore.get(LOCATION_COOKIE)?.value
  );

  if (provincia === undefined && localidad === undefined && savedLocation) {
    const params = new URLSearchParams();
    params.set("provincia", savedLocation.provincia);
    if (savedLocation.localidad) params.set("localidad", savedLocation.localidad);
    redirect(`/?${params.toString()}`);
  }

  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  let query = supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("activo", true)
    .gte("fecha", nowIso);

  if (localidad) {
    query = query.eq("localidad", localidad);
  } else if (provincia) {
    query = query.eq("provincia", provincia);
  }

  if (sort === "precio_asc") {
    query = query.order("precio", { ascending: true });
  } else if (sort === "precio_desc") {
    query = query.order("precio", { ascending: false });
  } else {
    query = query.order("fecha", { ascending: true });
  }

  const { data: events } = await query;

  // When a location filter comes up empty, suggest the soonest events
  // happening anywhere else instead of a dead end.
  let suggestions: EventRow[] = [];
  if ((localidad || provincia) && (!events || events.length === 0)) {
    const { data } = await supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .eq("activo", true)
      .gte("fecha", nowIso)
      .order("fecha", { ascending: true })
      .limit(3);
    suggestions = data ?? [];
  }

  const { data: provinciasRows } = await supabase
    .from("events")
    .select("provincia")
    .eq("activo", true)
    .gte("fecha", nowIso)
    .not("provincia", "is", null);
  const provinciasConEventos = [
    ...new Set((provinciasRows ?? []).map((r) => r.provincia as string)),
  ].sort();

  const listedEvents = events && events.length > 0 ? events : suggestions;
  const organizerIds = [...new Set(listedEvents.map((e) => e.organizer_id))];
  const { data: organizers } = organizerIds.length
    ? await supabase
        .from("organizer_public")
        .select("id, nombre, avatar_url")
        .in("id", organizerIds)
    : { data: [] };

  const organizerById = new Map((organizers ?? []).map((o) => [o.id, o]));

  return (
    <div className="py-6">
      <p className="font-mono text-xs tracking-[0.3em] text-violet uppercase mb-2">
        Próximamente
      </p>
      <h1 className="font-display text-4xl uppercase tracking-wide mb-1.5 leading-none">
        Eventos disponibles
      </h1>
      <p className="text-haze text-sm mb-5">
        Comprá tu entrada y recibí el QR al instante.
      </p>

      <LocationPrompt hasSavedLocation={Boolean(savedLocation)} />
      <LocationFilter provinciasConEventos={provinciasConEventos} />

      {!events || events.length === 0 ? (
        <>
          <TicketStub>
            <div className="flex flex-col items-center gap-2 text-center text-haze py-10">
              <Ticket className="size-8" />
              <p className="text-sm">
                {localidad || provincia
                  ? `No hay eventos en ${localidad || provincia} por ahora.`
                  : "Todavía no hay eventos publicados."}
              </p>
            </div>
          </TicketStub>

          {suggestions.length > 0 && (
            <div className="flex flex-col gap-4 mt-6">
              <p className="font-mono text-xs uppercase tracking-widest text-haze -mb-1">
                Eventos disponibles en otras zonas
              </p>
              {suggestions.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  organizer={organizerById.get(event.organizer_id)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-4">
          {(localidad || provincia) && (
            <p className="font-mono text-xs uppercase tracking-widest text-haze -mb-1">
              Eventos en {localidad || provincia}
            </p>
          )}
          <SortSelect />
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              organizer={organizerById.get(event.organizer_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({
  event,
  organizer,
}: {
  event: EventRow;
  organizer?: { nombre: string | null; avatar_url: string | null };
}) {
  const { day, month } = formatDayBadge(event.fecha);

  return (
    <Link href={`/events/${event.id}`} className="block group">
      <div className="rounded-3xl overflow-hidden bg-surface ring-1 ring-white/5 shadow-xl shadow-black/30 transition-transform group-active:scale-[0.98]">
        <div className="relative aspect-[16/10] bg-ink">
          {event.imagen_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.imagen_url}
              alt={event.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Ticket className="size-10 text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />

          <div className="absolute top-3 left-3 flex flex-col items-center rounded-xl bg-ink/80 backdrop-blur px-2.5 py-1.5 ring-1 ring-white/10 leading-none">
            <span className="font-display text-lg text-paper">{day}</span>
            <span className="font-mono text-[10px] tracking-widest text-violet">
              {month}
            </span>
          </div>

          <span className="absolute top-3 right-3 font-mono text-xl font-bold text-lime drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
            ${event.precio}
          </span>

          <div className="absolute bottom-0 inset-x-0 px-4 pb-3">
            <h2 className="font-display text-xl uppercase tracking-wide leading-tight text-paper drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              {event.nombre}
            </h2>
          </div>
        </div>

        <div className="px-4 py-3.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-violet uppercase tracking-wide">
            <CalendarDays className="size-3.5 shrink-0" />
            {formatRelativeLabel(event.fecha)} · {formatDateTime(event.fecha)}
          </div>
          {(event.lugar || event.localidad || event.provincia) && (
            <div className="flex items-center gap-1.5 text-xs text-haze mt-1.5">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">
                {[event.lugar, event.localidad, event.provincia]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}
          {organizer && (
            <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-white/5">
              <div className="size-5 rounded-full overflow-hidden bg-ink border border-white/10 shrink-0 flex items-center justify-center">
                {organizer.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={organizer.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-display text-[9px] text-haze">
                    {(organizer.nombre ?? "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-xs text-haze truncate">
                {organizer.nombre}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
