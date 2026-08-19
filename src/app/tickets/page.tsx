import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TicketStub } from "@/components/ticket-stub";
import { formatDate } from "@/lib/date";

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

export default async function TicketsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: tickets } = await supabase
    .from("tickets")
    .select(
      "id, estado, created_at, events(nombre, fecha, lugar, imagen_url, organizer_id)"
    )
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  const organizerIds = [
    ...new Set(
      (tickets ?? [])
        .map((t) => t.events?.organizer_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];
  const { data: organizers } = organizerIds.length
    ? await supabase
        .from("organizer_public")
        .select("id, nombre, avatar_url")
        .in("id", organizerIds)
    : { data: [] };

  const organizerById = new Map((organizers ?? []).map((o) => [o.id, o]));

  return (
    <div className="py-6">
      <p className="font-mono text-xs tracking-[0.3em] text-violet uppercase mb-2">
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
          {tickets.map((ticket) => {
            const organizer = ticket.events?.organizer_id
              ? organizerById.get(ticket.events.organizer_id)
              : undefined;
            return (
              <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block">
                <TicketStub className="hover:bg-surface/80 transition-colors">
                  <div className="flex gap-3">
                    {ticket.events?.imagen_url && (
                      <div className="size-16 shrink-0 rounded-lg overflow-hidden bg-ink">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ticket.events.imagen_url}
                          alt={ticket.events.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-display uppercase tracking-wide leading-tight">
                        {ticket.events?.nombre}
                      </p>
                      {organizer && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="size-4 rounded-full overflow-hidden bg-surface border border-white/10 shrink-0 flex items-center justify-center">
                            {organizer.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={organizer.avatar_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-display text-[8px] text-haze">
                                {(organizer.nombre ?? "?").charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-haze truncate">
                            {organizer.nombre}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-haze mt-1">
                        <CalendarDays className="size-3.5 shrink-0" />
                        {ticket.events?.fecha && formatDate(ticket.events.fecha)}
                      </div>
                      {ticket.events?.lugar && (
                        <div className="flex items-center gap-1.5 text-xs text-haze mt-0.5">
                          <MapPin className="size-3.5 shrink-0" />
                          <span className="truncate">{ticket.events.lugar}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-dashed border-white/10 flex items-center justify-between">
                    <span className="font-mono text-xs text-haze uppercase tracking-widest">
                      Entrada
                    </span>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
