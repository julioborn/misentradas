import { notFound, redirect } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { generateQrDataUrl } from "@/lib/qr";
import { formatDateTime } from "@/lib/date";
import { TicketStub } from "@/components/ticket-stub";

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
    .select(
      "id, qr_code, estado, events(nombre, fecha, lugar, provincia, localidad, imagen_url, organizer_id)"
    )
    .eq("id", id)
    .single();

  if (!ticket) notFound();

  const organizerId = ticket.events?.organizer_id;
  const { data: organizer } = organizerId
    ? await supabase
        .from("organizer_public")
        .select("nombre, avatar_url")
        .eq("id", organizerId)
        .single()
    : { data: null };

  const qrDataUrl = await generateQrDataUrl(ticket.qr_code);

  return (
    <div className="py-6">
      {ticket.events?.imagen_url && (
        <div className="aspect-video bg-surface rounded-xl overflow-hidden mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ticket.events.imagen_url}
            alt={ticket.events.nombre}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <TicketStub>
        <div className="flex flex-col items-center text-center">
          {organizer && (
            <div className="flex items-center gap-2 mb-3">
              <div className="size-8 rounded-full overflow-hidden bg-ink border border-white/10 shrink-0 flex items-center justify-center">
                {organizer.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={organizer.avatar_url}
                    alt={organizer.nombre ?? ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-display text-xs text-haze">
                    {(organizer.nombre ?? "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-sm text-haze">{organizer.nombre}</span>
            </div>
          )}

          <h1 className="font-display text-xl uppercase tracking-wide leading-tight text-balance">
            {ticket.events?.nombre}
          </h1>

          <div className="flex items-center gap-1.5 text-sm text-haze mt-2">
            <CalendarDays className="size-4 shrink-0" />
            {ticket.events?.fecha && formatDateTime(ticket.events.fecha)}
          </div>
          {(ticket.events?.lugar ||
            ticket.events?.localidad ||
            ticket.events?.provincia) && (
            <div className="flex items-center gap-1.5 text-sm text-haze mt-0.5">
              <MapPin className="size-4 shrink-0" />
              {[
                ticket.events?.lugar,
                ticket.events?.localidad,
                ticket.events?.provincia,
              ]
                .filter(Boolean)
                .join(", ")}
            </div>
          )}

          <span
            className={`mt-3 text-xs font-medium rounded-full px-2.5 py-1 ${
              ESTADO_CLASS[ticket.estado] ?? "bg-white/5 text-haze"
            }`}
          >
            {ESTADO_LABEL[ticket.estado] ?? ticket.estado}
          </span>
        </div>

        <div className="mt-6 pt-6 border-t border-dashed border-white/15 flex flex-col items-center text-center">
          <div className="rounded-2xl bg-paper p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt="Código QR de la entrada"
              className="size-56"
            />
          </div>
          <p className="font-mono text-xs text-haze mt-3 break-all tracking-wide">
            {ticket.qr_code}
          </p>
        </div>
      </TicketStub>
    </div>
  );
}
