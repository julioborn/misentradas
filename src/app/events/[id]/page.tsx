import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TicketStub } from "@/components/ticket-stub";
import { formatDateTime } from "@/lib/date";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: event } = await supabase
    .from("events")
    .select(
      "id, nombre, descripcion, fecha, lugar, precio, imagen_url, stock_disponible, activo, organizer_id"
    )
    .eq("id", id)
    .single();

  if (!event) notFound();

  const isOwnEvent = Boolean(user) && user!.id === event.organizer_id;

  const { data: organizer } = await supabase
    .from("organizer_public")
    .select("nombre, avatar_url")
    .eq("id", event.organizer_id)
    .single();

  const soldOut = event.stock_disponible <= 0;

  return (
    <div className="py-6">
      <div className="aspect-video bg-surface rounded-xl overflow-hidden mb-4">
        {event.imagen_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imagen_url}
            alt={event.nombre}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {organizer && (
        <div className="flex items-center gap-2 mb-2">
          <div className="size-8 rounded-full overflow-hidden bg-surface border border-white/10 shrink-0 flex items-center justify-center">
            {organizer.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={organizer.avatar_url}
                alt={organizer.nombre ?? ""}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-display text-xs text-haze">
                {(organizer.nombre ?? "?").charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-sm text-haze">{organizer.nombre}</span>
        </div>
      )}

      <h1 className="font-display text-2xl uppercase tracking-wide">
        {event.nombre}
      </h1>

      <div className="flex items-center gap-1.5 text-sm text-haze mt-2">
        <CalendarDays className="size-4" />
        {formatDateTime(event.fecha)}
      </div>
      {event.lugar && (
        <div className="flex items-center gap-1.5 text-sm text-haze mt-1">
          <MapPin className="size-4" />
          {event.lugar}
        </div>
      )}

      {event.descripcion && (
        <p className="text-sm text-paper/80 mt-4 whitespace-pre-line">
          {event.descripcion}
        </p>
      )}

      <TicketStub className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-haze">Precio</p>
            <p className="font-mono text-2xl text-lime">${event.precio}</p>
          </div>
          <p className="text-sm text-haze">
            {soldOut ? "Agotado" : `${event.stock_disponible} disponibles`}
          </p>
        </div>
      </TicketStub>

      {isOwnEvent ? (
        <Link
          href={`/organizer/events/${event.id}/manual`}
          className="mt-4 flex items-center justify-center gap-2 rounded-full border border-violet/40 text-violet py-2.5 font-semibold hover:bg-violet/10"
        >
          <Ticket className="size-4" />
          Generar entrada
        </Link>
      ) : event.activo && !soldOut ? (
        <Link
          href={
            user
              ? `/checkout/${event.id}`
              : `/auth/login?redirect=${encodeURIComponent(
                  `/checkout/${event.id}`
                )}`
          }
          className="mt-4 flex items-center justify-center gap-2 rounded-full bg-violet text-ink py-2.5 font-semibold"
        >
          <Ticket className="size-4" />
          Comprar entrada
        </Link>
      ) : (
        <button
          disabled
          className="mt-4 w-full rounded-full bg-surface text-haze py-2.5 font-medium"
        >
          {soldOut ? "Agotado" : "No disponible"}
        </button>
      )}
    </div>
  );
}
