import Link from "next/link";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TicketStub } from "@/components/ticket-stub";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, nombre, fecha, lugar, precio, imagen_url")
    .eq("activo", true)
    .order("fecha", { ascending: true });

  return (
    <div className="py-6">
      <p className="font-mono text-xs tracking-[0.3em] text-magenta uppercase mb-2">
        Próximamente
      </p>
      <h1 className="font-display text-3xl uppercase tracking-wide mb-1">
        Eventos disponibles
      </h1>
      <p className="text-haze text-sm mb-6">
        Comprá tu entrada y recibí el QR al instante.
      </p>

      {!events || events.length === 0 ? (
        <TicketStub>
          <div className="flex flex-col items-center gap-2 text-center text-haze py-10">
            <Ticket className="size-8" />
            <p className="text-sm">Todavía no hay eventos publicados.</p>
          </div>
        </TicketStub>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event) => (
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
                    <h2 className="font-display text-lg uppercase tracking-wide truncate">
                      {event.nombre}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-haze mt-1">
                      <CalendarDays className="size-3.5" />
                      {new Date(event.fecha).toLocaleString("es-AR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                    {event.lugar && (
                      <div className="flex items-center gap-1.5 text-xs text-haze mt-0.5">
                        <MapPin className="size-3.5" />
                        {event.lugar}
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
          ))}
        </div>
      )}
    </div>
  );
}
