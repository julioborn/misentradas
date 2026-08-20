import Link from "next/link";
import { redirect } from "next/navigation";
import { Image as ImageIcon, Link2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/app/account/actions";
import { TicketStub } from "@/components/ticket-stub";
import { DeleteAccountForm } from "@/components/delete-account-form";

const ERROR_LABEL: Record<string, string> = {
  nombre_requerido: "El nombre no puede quedar vacío.",
  no_se_pudo_guardar: "No pudimos guardar los cambios. Intentá de nuevo.",
  confirmacion_invalida: 'Escribí "ELIMINAR" exactamente para confirmar.',
};

const ROL_LABEL: Record<string, string> = {
  buyer: "Comprador",
  organizer: "Organizador",
};

export default async function AccountPage({
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
    .select("nombre, email, rol")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/");

  return (
    <div className="py-6">
      <p className="font-mono text-xs tracking-[0.3em] text-violet uppercase mb-2">
        {ROL_LABEL[profile.rol] ?? profile.rol}
      </p>
      <h1 className="font-display text-3xl uppercase tracking-wide mb-1">
        Mi cuenta
      </h1>
      <p className="text-haze text-sm mb-6">Tus datos personales.</p>

      {success && (
        <p className="text-sm text-lime bg-lime/10 border border-lime/20 rounded-lg px-3 py-2 mb-4">
          Datos actualizados.
        </p>
      )}
      {error && (
        <p className="text-sm text-violet bg-violet/10 border border-violet/20 rounded-lg px-3 py-2 mb-4">
          {ERROR_LABEL[error] ?? "Algo salió mal. Intentá de nuevo."}
        </p>
      )}

      <TicketStub>
        <form action={updateProfile} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="nombre" className="text-xs uppercase tracking-wide text-haze">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              defaultValue={profile.nombre ?? ""}
              className="rounded-lg bg-ink border border-white/10 px-3 py-2.5 text-paper focus:outline-none focus:ring-2 focus:ring-violet"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-haze">
              Email
            </label>
            <p className="rounded-lg bg-ink/50 border border-white/5 px-3 py-2.5 text-haze">
              {profile.email}
            </p>
          </div>

          <button
            type="submit"
            className="rounded-full bg-violet text-ink py-2.5 font-semibold"
          >
            Guardar cambios
          </button>
        </form>
      </TicketStub>

      {profile.rol === "organizer" && (
        <div className="flex flex-col gap-3 mt-6">
          <Link
            href="/organizer/profile"
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-surface px-4 py-3 hover:border-violet/40"
          >
            <ImageIcon className="size-5 text-violet shrink-0" />
            <div>
              <p className="text-sm font-medium">Logo del organizador</p>
              <p className="text-xs text-haze">
                El que aparece en tus eventos y entradas
              </p>
            </div>
          </Link>
          <Link
            href="/organizer/connect-mp"
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-surface px-4 py-3 hover:border-violet/40"
          >
            <Link2 className="size-5 text-violet shrink-0" />
            <div>
              <p className="text-sm font-medium">MercadoPago</p>
              <p className="text-xs text-haze">Conectar o desconectar tu cuenta</p>
            </div>
          </Link>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="text-xs uppercase tracking-wide text-haze mb-2">
          Zona de riesgo
        </p>
        <DeleteAccountForm />
      </div>
    </div>
  );
}
