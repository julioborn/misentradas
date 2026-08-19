import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Link2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TicketStub } from "@/components/ticket-stub";

export default async function ConnectMpPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const { connected, error } = await searchParams;
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

  if (!profile || profile.rol !== "organizer") {
    redirect("/");
  }

  const isConnected = Boolean(profile.mp_user_id);

  return (
    <div className="py-6">
      <p className="font-mono text-xs tracking-[0.3em] text-magenta uppercase mb-2">
        Panel organizador
      </p>
      <h1 className="font-display text-3xl uppercase tracking-wide mb-1">
        Conectar MercadoPago
      </h1>
      <p className="text-haze text-sm mb-6">
        Conectá tu cuenta para recibir el pago de tus entradas al instante.
      </p>

      {connected && (
        <p className="text-sm text-lime bg-lime/10 border border-lime/20 rounded-lg px-3 py-2 mb-4">
          ¡Listo! Tu cuenta de MercadoPago quedó conectada.
        </p>
      )}
      {error && (
        <p className="text-sm text-magenta bg-magenta/10 border border-magenta/20 rounded-lg px-3 py-2 mb-4">
          No pudimos conectar tu cuenta. Intentá de nuevo.
        </p>
      )}

      {isConnected ? (
        <TicketStub>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-5 text-lime shrink-0" />
            <div>
              <p className="font-medium">Cuenta conectada</p>
              <p className="font-mono text-sm text-haze">
                ID: {profile.mp_user_id}
              </p>
            </div>
          </div>
        </TicketStub>
      ) : (
        <Link
          href="/api/organizer/connect-mp/start"
          className="flex items-center justify-center gap-2 rounded-full bg-magenta text-ink py-2.5 font-semibold"
        >
          <Link2 className="size-4" />
          Conectar MercadoPago
        </Link>
      )}
    </div>
  );
}
