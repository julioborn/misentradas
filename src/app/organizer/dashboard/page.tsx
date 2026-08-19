import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Link2, Pencil, Plus, Ticket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TicketStub } from "@/components/ticket-stub";

export default async function OrganizerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol, mp_user_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.rol !== "organizer") redirect("/");

  const { data: events } = await supabase
    .from("events")
    .select("id, nombre, fecha, precio, stock_total, stock_disponible, activo")
    .eq("organizer_id", user.id)
    .order("fecha", { ascending: true });

  const mpConnected = Boolean(profile.mp_user_id);

  return (
    <div className="py-6">
      <p className="font-mono text-xs tracking-[0.3em] text-violet uppercase mb-2">
        Panel organizador
      </p>
      <h1 className="font-display text-3xl uppercase tracking-wide mb-1">
        Mis eventos
      </h1>
      <p className="text-haze text-sm mb-6">
        Gestioná tus eventos y las ventas en tiempo real.
      </p>

      {!mpConnected && (
        <Link
          href="/organizer/connect-mp"
          className="flex items-center gap-3 rounded-xl border border-lime/30 bg-lime/10 px-4 py-3 mb-6"
        >
          <Link2 className="size-5 text-lime shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-paper">
              Conectá MercadoPago
            </p>
            <p className="text-xs text-haze">
              Sin esto no vas a poder cobrar entradas
            </p>
          </div>
        </Link>
      )}

      <Link
        href="/organizer/events/new"
        className="flex items-center justify-center gap-2 rounded-full bg-violet text-ink py-2.5 font-semibold mb-6"
      >
        <Plus className="size-4" />
        Crear evento
      </Link>

      {!events || events.length === 0 ? (
        <TicketStub>
          <div className="flex flex-col items-center gap-2 text-center text-haze py-10">
            <Ticket className="size-8" />
            <p className="text-sm">Todavía no creaste ningún evento.</p>
          </div>
        </TicketStub>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event) => {
            const vendidas = event.stock_total - event.stock_disponible;
            return (
              <TicketStub key={event.id}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-display uppercase tracking-wide truncate">
                      {event.nombre}
                    </p>
                    <div className="flex items-center gap-1.5 text-sm text-haze mt-1">
                      <CalendarDays className="size-4" />
                      {new Date(event.fecha).toLocaleDateString("es-AR", {
                        dateStyle: "medium",
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!event.activo && (
                      <span className="text-xs font-medium rounded-full px-2.5 py-1 bg-white/5 text-haze">
                        Inactivo
                      </span>
                    )}
                    <Link
                      href={`/organizer/events/${event.id}/edit`}
                      aria-label="Editar evento"
                      className="text-haze hover:text-violet"
                    >
                      <Pencil className="size-4" />
                    </Link>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-dashed border-white/10 flex items-center justify-between">
                  <span className="font-mono text-xs text-haze uppercase tracking-widest">
                    {vendidas} / {event.stock_total} vendidas
                  </span>
                  <span className="font-mono text-lg text-lime">
                    ${event.precio}
                  </span>
                </div>
              </TicketStub>
            );
          })}
        </div>
      )}
    </div>
  );
}
