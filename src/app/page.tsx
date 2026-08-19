import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TicketStub } from "@/components/ticket-stub";
import { LocationFilter } from "@/components/location-filter";
import { LocationPrompt } from "@/components/location-prompt";
import { LOCATION_COOKIE, parseLocationCookie } from "@/lib/location-preference";
import { formatDateTime } from "@/lib/date";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ provincia?: string; localidad?: string }>;
}) {
  const { provincia, localidad } = await searchParams;
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

  let query = supabase
    .from("events")
    .select(
      "id, nombre, fecha, lugar, provincia, localidad, precio, imagen_url, organizer_id"
    )
    .eq("activo", true);

  if (localidad) {
    query = query.eq("localidad", localidad);
  } else if (provincia) {
    query = query.eq("provincia", provincia);
  }

  const { data: events } = await query.order("fecha", { ascending: true });

  const organizerIds = [...new Set((events ?? []).map((e) => e.organizer_id))];
  const { data: organizers } = organizerIds.length
    ? await supabase
        .from("organizer_public")
        .select("id, nombre, avatar_url")
        .in("id", organizerIds)
    : { data: [] };

  const organizerById = new Map(
    (organizers ?? []).map((o) => [o.id, o])
  );

  return (
    <div className="py-6">
      <p className="font-mono text-xs tracking-[0.3em] text-violet uppercase mb-2">
        Próximamente
      </p>
      <h1 className="font-display text-3xl uppercase tracking-wide mb-1">
        Eventos disponibles
      </h1>
      <p className="text-haze text-sm mb-4">
        Comprá tu entrada y recibí el QR al instante.
      </p>

      <LocationPrompt hasSavedLocation={Boolean(savedLocation)} />
      <LocationFilter />

      {!events || events.length === 0 ? (
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
      ) : (
        <div className="flex flex-col gap-4">
          {(localidad || provincia) && (
            <p className="font-mono text-xs uppercase tracking-widest text-haze -mb-1">
              Eventos en {localidad || provincia}
            </p>
          )}
          {events.map((event) => {
            const organizer = organizerById.get(event.organizer_id);
            return (
              <Link key={event.id} href={`/events/${event.id}`} className="block">
                <TicketStub className="hover:bg-surface/80 transition-colors">
                  <div className="flex gap-3">
                    {event.imagen_url && (
                      <div className="size-16 shrink-0 rounded-lg overflow-hidden bg-ink">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={event.imagen_url}
                          alt={event.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display text-base uppercase tracking-wide leading-tight">
                        {event.nombre}
                      </h2>
                      {organizer && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="size-4 rounded-full overflow-hidden bg-surface border border-white/10 shrink-0 flex items-center justify-center">
                            {organizer.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={organizer.avatar_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-display text-[8px] text-haze">
                                {(organizer.nombre ?? "?").charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-haze truncate">
                            {organizer.nombre}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-haze mt-1">
                        <CalendarDays className="size-3.5" />
                        {formatDateTime(event.fecha)}
                      </div>
                      {(event.lugar || event.localidad || event.provincia) && (
                        <div className="flex items-center gap-1.5 text-xs text-haze mt-0.5">
                          <MapPin className="size-3.5 shrink-0" />
                          <span className="truncate">
                            {[event.lugar, event.localidad, event.provincia]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-dashed border-white/10 flex items-center justify-between">
                    <span className="font-mono text-xs text-haze uppercase tracking-widest">
                      Entrada general
                    </span>
                    <span className="font-mono text-lg text-lime">
                      ${event.precio}
                    </span>
                  </div>
                </TicketStub>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
