import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateEvent } from "@/app/organizer/actions";
import { TicketStub } from "@/components/ticket-stub";

const ERROR_LABEL: Record<string, string> = {
  datos_invalidos: "Revisá los datos: falta algo o el precio/stock no es válido.",
  stock_menor_a_vendidas:
    "No podés bajar el stock por debajo de las entradas ya vendidas.",
  no_se_pudo_guardar: "No pudimos guardar los cambios. Intentá de nuevo.",
};

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: event } = await supabase
    .from("events")
    .select(
      "id, organizer_id, nombre, descripcion, fecha, lugar, precio, stock_total, imagen_url, activo"
    )
    .eq("id", id)
    .single();

  if (!event) notFound();
  if (event.organizer_id !== user.id) redirect("/organizer/dashboard");

  const updateEventWithId = updateEvent.bind(null, event.id);

  return (
    <div className="py-6">
      <p className="font-mono text-xs tracking-[0.3em] text-violet uppercase mb-2">
        Panel organizador
      </p>
      <h1 className="font-display text-3xl uppercase tracking-wide mb-1">
        Editar evento
      </h1>
      <p className="text-haze text-sm mb-6">{event.nombre}</p>

      {error && (
        <p className="text-sm text-violet bg-violet/10 border border-violet/20 rounded-lg px-3 py-2 mb-4">
          {ERROR_LABEL[error] ?? "Algo salió mal. Intentá de nuevo."}
        </p>
      )}

      <TicketStub>
        <form action={updateEventWithId} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="nombre" className="text-xs uppercase tracking-wide text-haze">
              Nombre del evento
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              defaultValue={event.nombre}
              className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper placeholder:text-haze/60 focus:outline-none focus:ring-2 focus:ring-violet"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="descripcion"
              className="text-xs uppercase tracking-wide text-haze"
            >
              Descripción (opcional)
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={3}
              defaultValue={event.descripcion ?? ""}
              className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper placeholder:text-haze/60 focus:outline-none focus:ring-2 focus:ring-violet resize-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="fecha" className="text-xs uppercase tracking-wide text-haze">
              Fecha y hora
            </label>
            <input
              id="fecha"
              name="fecha"
              type="datetime-local"
              required
              defaultValue={toDatetimeLocal(event.fecha)}
              className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper focus:outline-none focus:ring-2 focus:ring-violet"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="lugar" className="text-xs uppercase tracking-wide text-haze">
              Lugar (opcional)
            </label>
            <input
              id="lugar"
              name="lugar"
              type="text"
              defaultValue={event.lugar ?? ""}
              className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper placeholder:text-haze/60 focus:outline-none focus:ring-2 focus:ring-violet"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="precio" className="text-xs uppercase tracking-wide text-haze">
                Precio
              </label>
              <input
                id="precio"
                name="precio"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={event.precio}
                className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper focus:outline-none focus:ring-2 focus:ring-violet"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="stock_total"
                className="text-xs uppercase tracking-wide text-haze"
              >
                Entradas
              </label>
              <input
                id="stock_total"
                name="stock_total"
                type="number"
                min="1"
                step="1"
                required
                defaultValue={event.stock_total}
                className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper focus:outline-none focus:ring-2 focus:ring-violet"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="imagen" className="text-xs uppercase tracking-wide text-haze">
              Imagen del evento
            </label>
            {event.imagen_url && (
              <div className="size-20 rounded-lg overflow-hidden bg-ink mb-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.imagen_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <input
              id="imagen"
              name="imagen"
              type="file"
              accept="image/*"
              className="w-full rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper text-sm file:mr-3 file:rounded-full file:border-0 file:bg-violet file:text-ink file:px-3 file:py-1.5 file:font-semibold focus:outline-none focus:ring-2 focus:ring-violet"
            />
            <p className="text-xs text-haze">
              Subí una nueva solo si querés reemplazar la actual.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-paper">
            <input
              type="checkbox"
              name="activo"
              defaultChecked={event.activo}
              className="size-4 accent-violet"
            />
            Publicado (visible para compradores)
          </label>

          <button
            type="submit"
            className="rounded-full bg-violet text-ink py-2.5 font-semibold"
          >
            Guardar cambios
          </button>
        </form>
      </TicketStub>
    </div>
  );
}
