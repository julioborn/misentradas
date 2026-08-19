import { notFound, redirect } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { generateQrDataUrl } from "@/lib/qr";
import { formatDateTime } from "@/lib/date";

const ESTADO_LABEL: Record<string, string> = {
  pending_cash: "Pendiente de pago",
  confirmed: "Confirmada",
  used: "Ya utilizada",
  cancelled: "Cancelada",
};

const ESTADO_CLASS: Record<string, string> = {
  confirmed: "bg-lime/15 text-lime",
  used: "bg-white/5 text-haze",
  cancelled: "bg-violet/15 text-violet",
  pending_cash: "bg-amber-400/15 text-amber-300",
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, qr_code, estado, events(nombre, fecha, lugar)")
    .eq("id", id)
    .single();

  if (!ticket) notFound();

  const qrDataUrl = await generateQrDataUrl(ticket.qr_code);

  return (
    <div className="py-8 flex flex-col items-center text-center">
      <h1 className="font-display text-2xl uppercase tracking-wide">
        {ticket.events?.nombre}
      </h1>

      <div className="flex items-center gap-1.5 text-sm text-haze mt-1">
        <CalendarDays className="size-4" />
        {ticket.events?.fecha && formatDateTime(ticket.events.fecha)}
      </div>
      {ticket.events?.lugar && (
        <div className="flex items-center gap-1.5 text-sm text-haze mt-0.5">
          <MapPin className="size-4" />
          {ticket.events.lugar}
        </div>
      )}

      <span
        className={`mt-3 text-xs font-medium rounded-full px-2.5 py-1 ${
          ESTADO_CLASS[ticket.estado] ?? "bg-white/5 text-haze"
        }`}
      >
        {ESTADO_LABEL[ticket.estado] ?? ticket.estado}
      </span>

      <div className="mt-6 rounded-2xl bg-paper p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="Código QR de la entrada" className="size-64" />
      </div>

      <p className="font-mono text-xs text-haze mt-3 break-all tracking-wide">
        {ticket.qr_code}
      </p>
    </div>
  );
}
