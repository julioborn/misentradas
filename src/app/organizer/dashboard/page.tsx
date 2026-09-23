import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Banknote,
  CalendarDays,
  Link2,
  PackageSearch,
  Pencil,
  Plus,
  ScanLine,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TicketStub } from "@/components/ticket-stub";
import { formatDate } from "@/lib/date";
import { toggleEventActivo } from "@/app/organizer/actions";

const SUCCESS_LABEL: Record<string, string> = {
  evento_creado: "Evento creado.",
  evento_actualizado: "Cambios guardados.",
};

export default async function OrganizerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol, mp_user_id, nombre, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile || profile.rol !== "organizer") redirect("/");

  const { data: events } = await supabase
    .from("events")
    .select(
      "id, nombre, fecha, precio, stock_total, stock_disponible, activo, stock_habilitado"
    )
    .eq("organizer_id", user.id)
    .order("fecha", { ascending: true });

  const mpConnected = Boolean(profile.mp_user_id);

  return (
    <div className="py-6">
      <p className="font-mono text-xs tracking-[0.3em] text-violet uppercase mb-2">
        Panel organizador
      </p>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-3xl uppercase tracking-wide">
          Mis eventos
        </h1>
        <Link
          href="/organizer/profile"
          aria-label="Editar logo"
          className="size-11 rounded-full overflow-hidden bg-surface border border-white/10 shrink-0 flex items-center justify-center"
        >
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.nombre ?? "Logo"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-display text-lg text-haze">
              {(profile.nombre ?? "?").charAt(0).toUpperCase()}
            </span>
          )}
        </Link>
      </div>
      <p className="text-haze text-sm mb-6">
        Gestioná tus eventos y las ventas en tiempo real.
      </p>

      {success && SUCCESS_LABEL[success] && (
        <p className="text-sm text-lime bg-lime/10 border border-lime/20 rounded-lg px-3 py-2 mb-4">
          {SUCCESS_LABEL[success]}
        </p>
      )}

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
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-base uppercase tracking-wide leading-tight">
                      {event.nombre}
                    </p>
                    <div className="flex items-center gap-1.5 text-sm text-haze mt-1">
                      <CalendarDays className="size-4 shrink-0" />
                      {formatDate(event.fecha)}
                    </div>
                  </div>
                  <form
                    action={toggleEventActivo.bind(null, event.id)}
                    className="flex flex-col items-center gap-1 shrink-0"
                  >
                    <button
                      type="submit"
                      aria-label={
                        event.activo ? "Ocultar evento" : "Publicar evento"
                      }
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        event.activo ? "bg-lime" : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`inline-block size-3.5 transform rounded-full bg-ink transition-transform ${
                          event.activo ? "translate-x-4" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className="text-[10px] uppercase tracking-wide text-haze">
                      {event.activo ? "Publicado" : "Oculto"}
                    </span>
                  </form>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3">
                  <ActionLink
                    href={`/organizer/events/${event.id}/manual`}
                    icon={Banknote}
                    label="Manual"
                  />
                  <ActionLink
                    href={`/scan/${event.id}`}
                    icon={ScanLine}
                    label="Escanear"
                  />
                  <ActionLink
                    href={`/organizer/events/${event.id}/staff`}
                    icon={Users}
                    label="Staff"
                  />
                  {event.stock_habilitado && (
                    <ActionLink
                      href={`/organizer/events/${event.id}/stock`}
                      icon={PackageSearch}
                      label="Stock"
                    />
                  )}
                  <ActionLink
                    href={`/organizer/events/${event.id}/edit`}
                    icon={Pencil}
                    label="Editar"
                  />
                </div>

                <Link
                  href={`/organizer/events/${event.id}/sales`}
                  className="mt-3 pt-3 border-t border-dashed border-white/10 flex items-center justify-between hover:text-violet"
                >
                  <span className="font-mono text-xs text-haze uppercase tracking-widest hover:text-violet">
                    {vendidas} / {event.stock_total} vendidas
                  </span>
                  <span className="font-mono text-lg text-lime">
                    ${event.precio}
                  </span>
                </Link>
              </TicketStub>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActionLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1 rounded-xl bg-ink border border-white/10 py-3 text-haze hover:text-violet hover:border-violet/30 transition-colors"
    >
      <Icon className="size-5" />
      <span className="text-[10px] font-medium uppercase tracking-wide">
        {label}
      </span>
    </Link>
  );
}
