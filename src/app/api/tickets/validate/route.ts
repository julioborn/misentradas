import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const REASON_MESSAGE: Record<string, string> = {
  not_found: "QR no reconocido.",
  already_used: "Esta entrada ya fue utilizada.",
  cancelled: "Esta entrada está cancelada.",
  pending: "Esta entrada todavía no está paga.",
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const eventId = body?.eventId as string | undefined;
  const qrCode = body?.qrCode as string | undefined;

  if (!eventId || !qrCode) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: event } = await admin
    .from("events")
    .select("id, nombre, organizer_id")
    .eq("id", eventId)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
  }

  const isOrganizer = event.organizer_id === user.id;

  if (!isOrganizer) {
    const { data: staff } = await admin
      .from("event_staff")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .single();

    if (!staff) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
  }

  const { data: ticket } = await admin
    .from("tickets")
    .select("id, estado, buyer:profiles!tickets_buyer_id_fkey(nombre, email)")
    .eq("event_id", eventId)
    .eq("qr_code", qrCode)
    .single();

  if (!ticket) {
    return NextResponse.json({
      valid: false,
      reason: "not_found",
      message: REASON_MESSAGE.not_found,
    });
  }

  if (ticket.estado !== "confirmed") {
    const reason =
      ticket.estado === "used"
        ? "already_used"
        : ticket.estado === "cancelled"
          ? "cancelled"
          : "pending";

    return NextResponse.json({
      valid: false,
      reason,
      message: REASON_MESSAGE[reason],
      buyerName: ticket.buyer?.nombre ?? null,
    });
  }

  const { error } = await admin
    .from("tickets")
    .update({ estado: "used" })
    .eq("id", ticket.id)
    .eq("estado", "confirmed");

  if (error) {
    return NextResponse.json(
      { error: "No pudimos validar la entrada. Intentá de nuevo." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    valid: true,
    buyerName: ticket.buyer?.nombre ?? null,
    buyerEmail: ticket.buyer?.email ?? null,
    eventNombre: event.nombre,
  });
}
