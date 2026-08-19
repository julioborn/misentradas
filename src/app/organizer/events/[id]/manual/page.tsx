import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Ticket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { generateManualTicket } from "@/app/organizer/actions";
import { TicketStub } from "@/components/ticket-stub";

const ERROR_LABEL: Record<string, string> = {
  sin_stock: "No quedan entradas disponibles para este evento.",
  no_se_pudo_generar: "No pudimos generar la entrada. Intentá de nuevo.",
};

export default async function ManualTicketPage({
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
    .select("id, nombre, organizer_id, precio, stock_disponible")
    .eq("id", id)
    .single();

  if (!event) notFound();
  if (event.organizer_id !== user.id) redirect("/organizer/dashboard");

  const generateWithId = generateManualTicket.bind(null, id);

  return (
    <div className="py-6">
      <Link
        href="/organizer/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-haze hover:text-paper mb-4"
      >
        <ArrowLeft className="size-4" />
        Volver a mis eventos
      </Link>

      <p className="font-mono text-xs tracking-[0.3em] text-violet uppercase mb-2">
        Panel organizador
      </p>
      <h1 className="font-display text-3xl uppercase tracking-wide mb-1">
        Generar entrada
      </h1>
      <p className="text-haze text-sm mb-6">
        {event.nombre} — para pagos en efectivo o entradas de cortesía.{" "}
        {event.stock_disponible} disponibles.
      </p>

      {error && (
        <p className="text-sm text-violet bg-violet/10 border border-violet/20 rounded-lg px-3 py-2 mb-4">
          {ERROR_LABEL[error] ?? "Algo salió mal. Intentá de nuevo."}
        </p>
      )}

      <TicketStub>
        <form action={generateWithId} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="nombre" className="text-xs uppercase tracking-wide text-haze">
              Nombre del comprador (opcional)
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper placeholder:text-haze/60 focus:outline-none focus:ring-2 focus:ring-violet"
              placeholder="Para identificarla en la puerta"
            />
          </div>

          <button
            type="submit"
            disabled={event.stock_disponible < 1}
            className="flex items-center justify-center gap-2 rounded-full bg-violet text-ink py-2.5 font-semibold disabled:opacity-50"
          >
            <Ticket className="size-4" />
            Generar entrada
          </button>
        </form>
      </TicketStub>
    </div>
  );
}
