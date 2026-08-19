import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Scanner } from "./scanner";

export default async function ScanEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: event } = await supabase
    .from("events")
    .select("id, nombre, organizer_id")
    .eq("id", eventId)
    .single();

  if (!event) notFound();

  const isOrganizer = event.organizer_id === user.id;

  if (!isOrganizer) {
    const { data: staff } = await supabase
      .from("event_staff")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .single();

    if (!staff) redirect("/scan");
  }

  return (
    <div className="py-6">
      <Link
        href="/scan"
        className="inline-flex items-center gap-1.5 text-sm text-haze hover:text-paper mb-4"
      >
        <ArrowLeft className="size-4" />
        Otros eventos
      </Link>

      <p className="font-mono text-xs tracking-[0.3em] text-violet uppercase mb-2">
        Puerta
      </p>
      <h1 className="font-display text-2xl uppercase tracking-wide mb-1">
        {event.nombre}
      </h1>
      <p className="text-haze text-sm mb-6">
        Escaneá el QR de cada entrada al ingresar.
      </p>

      <Scanner eventId={event.id} />
    </div>
  );
}
