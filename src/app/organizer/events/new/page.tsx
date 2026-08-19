import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createEvent } from "@/app/organizer/actions";
import { TicketStub } from "@/components/ticket-stub";

const ERROR_LABEL: Record<string, string> = {
  datos_invalidos: "Revisá los datos: falta algo o el precio/stock no es válido.",
  no_se_pudo_crear: "No pudimos crear el evento. Intentá de nuevo.",
};

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (!profile || profile.rol !== "organizer") redirect("/");

  return (
    <div className="py-6">
      <p className="font-mono text-xs tracking-[0.3em] text-violet uppercase mb-2">
        Panel organizador
      </p>
      <h1 className="font-display text-3xl uppercase tracking-wide mb-1">
        Crear evento
      </h1>
      <p className="text-haze text-sm mb-6">
        Completá los datos, después vas a poder editarlos.
      </p>

      {error && (
        <p className="text-sm text-violet bg-violet/10 border border-violet/20 rounded-lg px-3 py-2 mb-4">
          {ERROR_LABEL[error] ?? "Algo salió mal. Intentá de nuevo."}
        </p>
      )}

      <TicketStub>
        <form action={createEvent} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="nombre" className="text-xs uppercase tracking-wide text-haze">
              Nombre del evento
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper placeholder:text-haze/60 focus:outline-none focus:ring-2 focus:ring-violet"
              placeholder="Fiesta Neón"
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
              className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper placeholder:text-haze/60 focus:outline-none focus:ring-2 focus:ring-violet resize-none"
              placeholder="Line up, dress code, lo que quieras contar"
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
              className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper placeholder:text-haze/60 focus:outline-none focus:ring-2 focus:ring-violet"
              placeholder="Costanera 1234, CABA"
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
                className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper placeholder:text-haze/60 focus:outline-none focus:ring-2 focus:ring-violet"
                placeholder="8500"
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
                className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper placeholder:text-haze/60 focus:outline-none focus:ring-2 focus:ring-violet"
                placeholder="200"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="imagen_url"
              className="text-xs uppercase tracking-wide text-haze"
            >
              URL de imagen (opcional)
            </label>
            <input
              id="imagen_url"
              name="imagen_url"
              type="url"
              className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper placeholder:text-haze/60 focus:outline-none focus:ring-2 focus:ring-violet"
              placeholder="https://..."
            />
          </div>

          <button
            type="submit"
            className="rounded-full bg-violet text-ink py-2.5 font-semibold"
          >
            Publicar evento
          </button>
        </form>
      </TicketStub>
    </div>
  );
}
