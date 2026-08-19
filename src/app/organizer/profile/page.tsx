import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateOrganizerAvatar } from "@/app/organizer/actions";
import { TicketStub } from "@/components/ticket-stub";

const ERROR_LABEL: Record<string, string> = {
  no_se_pudo_subir: "No pudimos subir la imagen. Probá con otro archivo.",
};

export default async function OrganizerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol, nombre, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile || profile.rol !== "organizer") redirect("/");

  return (
    <div className="py-6">
      <p className="font-mono text-xs tracking-[0.3em] text-violet uppercase mb-2">
        Panel organizador
      </p>
      <h1 className="font-display text-3xl uppercase tracking-wide mb-1">
        Logo
      </h1>
      <p className="text-haze text-sm mb-6">
        Este es el logo que va a aparecer en tus entradas (el del boliche o
        la marca del evento).
      </p>

      {success && (
        <p className="text-sm text-lime bg-lime/10 border border-lime/20 rounded-lg px-3 py-2 mb-4">
          Logo actualizado.
        </p>
      )}
      {error && (
        <p className="text-sm text-violet bg-violet/10 border border-violet/20 rounded-lg px-3 py-2 mb-4">
          {ERROR_LABEL[error] ?? "Algo salió mal. Intentá de nuevo."}
        </p>
      )}

      <TicketStub>
        <div className="flex flex-col items-center gap-4">
          <div className="size-24 rounded-full overflow-hidden bg-ink border border-white/10 flex items-center justify-center">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.nombre ?? "Logo"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-display text-3xl text-haze">
                {(profile.nombre ?? "?").charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <form
            action={updateOrganizerAvatar}
            className="w-full flex flex-col gap-3"
          >
            <input
              id="logo"
              name="logo"
              type="file"
              accept="image/*"
              required
              className="w-full rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper text-sm file:mr-3 file:rounded-full file:border-0 file:bg-violet file:text-ink file:px-3 file:py-1.5 file:font-semibold focus:outline-none focus:ring-2 focus:ring-violet"
            />
            <button
              type="submit"
              className="rounded-full bg-violet text-ink py-2.5 font-semibold"
            >
              Guardar logo
            </button>
          </form>
        </div>
      </TicketStub>
    </div>
  );
}
