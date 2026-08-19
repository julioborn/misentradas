import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, ScanLine } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TicketStub } from "@/components/ticket-stub";
import { formatDate } from "@/lib/date";

export default async function ScanHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: ownEvents } = await supabase
    .from("events")
    .select("id, nombre, fecha")
    .eq("organizer_id", user.id);

  const { data: staffRows } = await supabase
    .from("event_staff")
    .select("event:events(id, nombre, fecha)")
    .eq("user_id", user.id);

  const staffEvents = (staffRows ?? [])
    .map((r) => r.event)
    .filter((e): e is { id: string; nombre: string; fecha: string } => Boolean(e));

  const seen = new Set<string>();
  const events = [...(ownEvents ?? []), ...staffEvents].filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  return (
    <div className="py-6">
      <p className="font-mono text-xs tracking-[0.3em] text-violet uppercase mb-2">
        Puerta
      </p>
      <h1 className="font-display text-3xl uppercase tracking-wide mb-1">
        Escanear
      </h1>
      <p className="text-haze text-sm mb-6">
        Elegí el evento para validar entradas en la puerta.
      </p>

      {events.length === 0 ? (
        <TicketStub>
          <div className="flex flex-col items-center gap-2 text-center text-haze py-10">
            <ScanLine className="size-8" />
            <p className="text-sm">
              No tenés ningún evento para escanear todavía.
            </p>
          </div>
        </TicketStub>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event) => (
            <Link key={event.id} href={`/scan/${event.id}`} className="block">
              <TicketStub className="hover:bg-surface/80 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display uppercase tracking-wide leading-tight">
                      {event.nombre}
                    </p>
                    <div className="flex items-center gap-1.5 text-sm text-haze mt-1">
                      <CalendarDays className="size-4 shrink-0" />
                      {formatDate(event.fecha)}
                    </div>
                  </div>
                  <ScanLine className="size-5 text-violet shrink-0" />
                </div>
              </TicketStub>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
