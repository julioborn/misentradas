import Link from "next/link";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, nombre, fecha, lugar, precio, imagen_url")
    .eq("activo", true)
    .order("fecha", { ascending: true });

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold mb-1">Eventos disponibles</h1>
      <p className="text-neutral-500 text-sm mb-6">
        Comprá tu entrada y recibí el QR al instante.
      </p>

      {!events || events.length === 0 ? (
        <div className="flex flex-col items-center gap-2 text-center text-neutral-400 py-16">
          <Ticket className="size-8" />
          <p className="text-sm">Todavía no hay eventos publicados.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="block rounded-xl border border-neutral-200 bg-white overflow-hidden hover:border-violet-300 transition-colors"
            >
              <div className="aspect-video bg-neutral-100">
                {event.imagen_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.imagen_url}
                    alt={event.nombre}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold">{event.nombre}</h2>
                <div className="flex items-center gap-1.5 text-sm text-neutral-500 mt-1">
                  <CalendarDays className="size-4" />
                  {new Date(event.fecha).toLocaleString("es-AR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
                {event.lugar && (
                  <div className="flex items-center gap-1.5 text-sm text-neutral-500 mt-0.5">
                    <MapPin className="size-4" />
                    {event.lugar}
                  </div>
                )}
                <p className="font-semibold text-violet-600 mt-2">
                  ${event.precio}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
