import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Mail, Ticket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TicketStub } from "@/components/ticket-stub";

const ESTADO_LABEL: Record<string, string> = {
  pending_cash: "Pendiente de pago",
  confirmed: "Confirmada",
  used: "Utilizada",
  cancelled: "Cancelada",
};

const ESTADO_CLASS: Record<string, string> = {
  confirmed: "bg-lime/15 text-lime",
  used: "bg-white/5 text-haze",
  cancelled: "bg-violet/15 text-violet",
  pending_cash: "bg-amber-400/15 text-amber-300",
};

const METODO_LABEL: Record<string, string> = {
  mercadopago: "MercadoPago",
  efectivo: "Efectivo",
  manual: "Manual",
};

export default async function EventSalesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: event } = await supabase
    .from("events")
    .select("id, nombre, organizer_id, stock_total, stock_disponible")
    .eq("id", id)
    .single();

  if (!event) notFound();
  if (event.organizer_id !== user.id) redirect("/organizer/dashboard");

  const { data: tickets } = await supabase
    .from("tickets")
    .select(
      "id, estado, metodo_pago, created_at, buyer:profiles!tickets_buyer_id_fkey(nombre, email)"
    )
    .eq("event_id", id)
    .order("created_at", { ascending: false });

  const vendidas = event.stock_total - event.stock_disponible;

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
        Ventas
      </h1>
      <p className="text-haze text-sm mb-6">
        {event.nombre} — {vendidas} / {event.stock_total} vendidas
      </p>

      {!tickets || tickets.length === 0 ? (
        <TicketStub>
          <div className="flex flex-col items-center gap-2 text-center text-haze py-10">
            <Ticket className="size-8" />
            <p className="text-sm">Todavía no se vendió ninguna entrada.</p>
          </div>
        </TicketStub>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map((ticket) => (
            <TicketStub key={ticket.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {ticket.buyer?.nombre ?? "Sin nombre"}
                  </p>
                  <div className="flex items-center gap-1.5 text-sm text-haze mt-1 truncate">
                    <Mail className="size-3.5 shrink-0" />
                    {ticket.buyer?.email}
                  </div>
                </div>
                <span
                  className={`text-xs font-medium rounded-full px-2.5 py-1 shrink-0 ${
                    ESTADO_CLASS[ticket.estado] ?? "bg-white/5 text-haze"
                  }`}
                >
                  {ESTADO_LABEL[ticket.estado] ?? ticket.estado}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-dashed border-white/10 flex items-center justify-between text-xs text-haze">
                <span>
                  {METODO_LABEL[ticket.metodo_pago] ?? ticket.metodo_pago}
                </span>
                <span className="font-mono">
                  {new Date(ticket.created_at).toLocaleString("es-AR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </TicketStub>
          ))}
        </div>
      )}
    </div>
  );
}
