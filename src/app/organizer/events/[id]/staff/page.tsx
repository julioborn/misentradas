import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ScanLine, UserMinus, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { addEventStaff, removeEventStaff } from "@/app/organizer/actions";
import { TicketStub } from "@/components/ticket-stub";

const ERROR_LABEL: Record<string, string> = {
  email_requerido: "Ingresá un email.",
  usuario_no_encontrado:
    "No encontramos ninguna cuenta con ese email. Tiene que estar registrado en Mis Entradas.",
  ya_asignado: "Esa persona ya está asignada como staff de este evento.",
  no_se_pudo_agregar: "No pudimos agregarlo. Intentá de nuevo.",
};

export default async function EventStaffPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string; removed?: string }>;
}) {
  const { id } = await params;
  const { error, success, removed } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: event } = await supabase
    .from("events")
    .select("id, nombre, organizer_id")
    .eq("id", id)
    .single();

  if (!event) notFound();
  if (event.organizer_id !== user.id) redirect("/organizer/dashboard");

  const { data: staff } = await supabase
    .from("event_staff")
    .select("id, user_id, created_at, profile:profiles!event_staff_user_id_fkey(nombre, email)")
    .eq("event_id", id)
    .order("created_at", { ascending: false });

  const addStaffWithId = addEventStaff.bind(null, id);

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
        Staff de entrada
      </h1>
      <p className="text-haze text-sm mb-6">
        {event.nombre} — quiénes pueden escanear entradas en la puerta.
      </p>

      {success && (
        <p className="text-sm text-lime bg-lime/10 border border-lime/20 rounded-lg px-3 py-2 mb-4">
          Persona agregada al staff.
        </p>
      )}
      {removed && (
        <p className="text-sm text-lime bg-lime/10 border border-lime/20 rounded-lg px-3 py-2 mb-4">
          Persona quitada del staff.
        </p>
      )}
      {error && (
        <p className="text-sm text-violet bg-violet/10 border border-violet/20 rounded-lg px-3 py-2 mb-4">
          {ERROR_LABEL[error] ?? "Algo salió mal. Intentá de nuevo."}
        </p>
      )}

      <Link
        href={`/scan/${event.id}`}
        className="flex items-center justify-center gap-2 rounded-full border border-violet/40 text-violet py-2.5 font-semibold mb-6 hover:bg-violet/10"
      >
        <ScanLine className="size-4" />
        Ir al modo escáner
      </Link>

      <TicketStub className="mb-6">
        <form action={addStaffWithId} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-xs uppercase tracking-wide text-haze">
              Agregar por email
            </label>
            <p className="text-xs text-haze">
              Tiene que ser el email con el que esa persona ya se registró en
              Mis Entradas.
            </p>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper placeholder:text-haze/60 focus:outline-none focus:ring-2 focus:ring-violet"
              placeholder="staff@email.com"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-full bg-violet text-ink py-2.5 font-semibold"
          >
            <UserPlus className="size-4" />
            Agregar
          </button>
        </form>
      </TicketStub>

      {!staff || staff.length === 0 ? (
        <p className="text-sm text-haze text-center py-6">
          Todavía no asignaste a nadie. Vos como organizador siempre podés
          escanear.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {staff.map((s) => (
            <TicketStub key={s.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {s.profile?.nombre ?? "Sin nombre"}
                  </p>
                  <p className="text-sm text-haze truncate">{s.profile?.email}</p>
                </div>
                <form action={removeEventStaff.bind(null, id, s.id)}>
                  <button
                    type="submit"
                    aria-label="Quitar del staff"
                    className="text-haze hover:text-violet shrink-0"
                  >
                    <UserMinus className="size-4" />
                  </button>
                </form>
              </div>
            </TicketStub>
          ))}
        </div>
      )}
    </div>
  );
}
