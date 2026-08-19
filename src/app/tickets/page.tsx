import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Ticket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const ESTADO_LABEL: Record<string, string> = {
  pending_cash: "Pendiente de pago",
  confirmed: "Confirmada",
  used: "Utilizada",
  cancelled: "Cancelada",
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
      <h1 className="text-2xl font-bold mb-1">Mis entradas</h1>
      <p className="text-neutral-500 text-sm mb-6">
        Tus compras y el estado de cada entrada.
      </p>

      {!tickets || tickets.length === 0 ? (
        <div className="flex flex-col items-center gap-2 text-center text-neutral-400 py-16">
          <Ticket className="size-8" />
          <p className="text-sm">Todavía no compraste ninguna entrada.</p>
          <Link href="/" className="text-violet-600 text-sm font-medium mt-2">
            Ver eventos
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 hover:border-violet-300 transition-colors"
            >
              <div>
                <p className="font-semibold">{ticket.events?.nombre}</p>
                <div className="flex items-center gap-1.5 text-sm text-neutral-500 mt-1">
                  <CalendarDays className="size-4" />
                  {ticket.events?.fecha &&
                    new Date(ticket.events.fecha).toLocaleDateString("es-AR", {
                      dateStyle: "medium",
                    })}
                </div>
              </div>
              <span
                className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                  ticket.estado === "confirmed"
                    ? "bg-green-50 text-green-700"
                    : ticket.estado === "used"
                      ? "bg-neutral-100 text-neutral-500"
                      : ticket.estado === "cancelled"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                }`}
              >
                {ESTADO_LABEL[ticket.estado] ?? ticket.estado}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
