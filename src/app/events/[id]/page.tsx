import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select(
      "id, nombre, descripcion, fecha, lugar, precio, imagen_url, stock_disponible, activo"
    )
    .eq("id", id)
    .single();

  if (!event) notFound();

  const soldOut = event.stock_disponible <= 0;

  return (
    <div className="py-6">
      <div className="aspect-video bg-neutral-100 rounded-xl overflow-hidden mb-4">
        {event.imagen_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imagen_url}
            alt={event.nombre}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <h1 className="text-2xl font-bold">{event.nombre}</h1>

      <div className="flex items-center gap-1.5 text-sm text-neutral-500 mt-2">
        <CalendarDays className="size-4" />
        {new Date(event.fecha).toLocaleString("es-AR", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </div>
      {event.lugar && (
        <div className="flex items-center gap-1.5 text-sm text-neutral-500 mt-1">
          <MapPin className="size-4" />
          {event.lugar}
        </div>
      )}

      {event.descripcion && (
        <p className="text-sm text-neutral-700 mt-4 whitespace-pre-line">
          {event.descripcion}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3">
        <div>
          <p className="text-xs text-neutral-500">Precio</p>
          <p className="text-xl font-bold text-violet-600">${event.precio}</p>
        </div>
        <p className="text-sm text-neutral-500">
          {soldOut ? "Agotado" : `${event.stock_disponible} disponibles`}
        </p>
      </div>

      {event.activo && !soldOut ? (
        <Link
          href={`/checkout/${event.id}`}
          className="mt-4 flex items-center justify-center gap-2 rounded-md bg-violet-600 text-white py-2.5 font-medium"
        >
          <Ticket className="size-4" />
          Comprar entrada
        </Link>
      ) : (
        <button
          disabled
          className="mt-4 w-full rounded-md bg-neutral-200 text-neutral-500 py-2.5 font-medium"
        >
          {soldOut ? "Agotado" : "No disponible"}
        </button>
      )}
    </div>
  );
}
