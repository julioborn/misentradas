import { notFound, redirect } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { generateQrDataUrl } from "@/lib/qr";

const ESTADO_LABEL: Record<string, string> = {
  pending_cash: "Pendiente de pago",
  confirmed: "Confirmada",
  used: "Ya utilizada",
  cancelled: "Cancelada",
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
      <h1 className="text-xl font-bold">{ticket.events?.nombre}</h1>

      <div className="flex items-center gap-1.5 text-sm text-neutral-500 mt-1">
        <CalendarDays className="size-4" />
        {ticket.events?.fecha &&
          new Date(ticket.events.fecha).toLocaleString("es-AR", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
      </div>
      {ticket.events?.lugar && (
        <div className="flex items-center gap-1.5 text-sm text-neutral-500 mt-0.5">
          <MapPin className="size-4" />
          {ticket.events.lugar}
        </div>
      )}

      <span
        className={`mt-3 text-xs font-medium rounded-full px-2.5 py-1 ${
          ticket.estado === "confirmed"
            ? "bg-green-50 text-green-700"
            : ticket.estado === "used"
              ? "bg-neutral-100 text-neutral-500"
              : ticket.estado === "cancelled"
                ? "bg-red-50 text-red-700"
                : "bg-amber-50 text-amber-700"
        }`}
      >
        {ESTADO_LABEL[ticket.estado] ?? ticket.estado}
      </span>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="Código QR de la entrada" className="size-64" />
      </div>

      <p className="text-xs text-neutral-400 mt-3 break-all">{ticket.qr_code}</p>
    </div>
  );
}
