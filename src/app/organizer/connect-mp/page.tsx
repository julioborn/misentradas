import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Link2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

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
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-1">Conectar MercadoPago</h1>
      <p className="text-neutral-500 text-sm mb-6">
        Conectá tu cuenta para recibir el pago de tus entradas al instante.
      </p>

      {connected && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-4">
          ¡Listo! Tu cuenta de MercadoPago quedó conectada.
        </p>
      )}
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
          No pudimos conectar tu cuenta. Intentá de nuevo.
        </p>
      )}

      {isConnected ? (
        <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3">
          <CheckCircle2 className="size-5 text-green-600 shrink-0" />
          <div>
            <p className="font-medium">Cuenta conectada</p>
            <p className="text-sm text-neutral-500">
              ID de MercadoPago: {profile.mp_user_id}
            </p>
          </div>
        </div>
      ) : (
        <Link
          href="/api/organizer/connect-mp/start"
          className="flex items-center justify-center gap-2 rounded-md bg-violet-600 text-white py-2.5 font-medium"
        >
          <Link2 className="size-4" />
          Conectar MercadoPago
        </Link>
      )}
    </div>
  );
}
