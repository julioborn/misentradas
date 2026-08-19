import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Ticket } from "lucide-react";
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
  cancelled: "bg-magenta/15 text-magenta",
  pending_cash: "bg-amber-400/15 text-amber-300",
};

export default async function TicketsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: tickets } = await supabase
    .from("tickets")
    .select("id, estado, created_at, events(nombre, fecha, lugar)")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="py-6">
      <p className="font-mono text-xs tracking-[0.3em] text-magenta uppercase mb-2">
        Tu billetera
      </p>
      <h1 className="font-display text-3xl uppercase tracking-wide mb-1">
        Mis entradas
      </h1>
      <p className="text-haze text-sm mb-6">
        Tus compras y el estado de cada entrada.
      </p>

      {!tickets || tickets.length === 0 ? (
        <TicketStub>
          <div className="flex flex-col items-center gap-2 text-center text-haze py-10">
            <Ticket className="size-8" />
            <p className="text-sm">Todavía no compraste ninguna entrada.</p>
            <Link href="/" className="text-lime text-sm font-medium mt-2">
              Ver eventos
            </Link>
          </div>
        </TicketStub>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block">
              <TicketStub className="hover:bg-surface/80 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display uppercase tracking-wide">
                      {ticket.events?.nombre}
                    </p>
                    <div className="flex items-center gap-1.5 text-sm text-haze mt-1">
                      <CalendarDays className="size-4" />
                      {ticket.events?.fecha &&
                        new Date(ticket.events.fecha).toLocaleDateString("es-AR", {
                          dateStyle: "medium",
                        })}
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
              </TicketStub>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
