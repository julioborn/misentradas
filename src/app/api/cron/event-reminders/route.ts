import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUsers } from "@/lib/push-send";

// Reminders go out once an event is this close to starting.
const REMINDER_WINDOW_HOURS = 2;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_HOURS * 60 * 60 * 1000);

  const { data: events } = await admin
    .from("events")
    .select("id, nombre")
    .eq("activo", true)
    .is("reminder_sent_at", null)
    .gt("fecha", now.toISOString())
    .lte("fecha", windowEnd.toISOString());

  if (!events || events.length === 0) {
    return NextResponse.json({ remindedEvents: 0 });
  }

  let remindedEvents = 0;

  for (const event of events) {
    const { data: tickets } = await admin
      .from("tickets")
      .select("buyer_id")
      .eq("event_id", event.id)
      .eq("estado", "confirmed")
      .not("buyer_id", "is", null);

    const buyerIds = [
      ...new Set((tickets ?? []).map((t) => t.buyer_id).filter((id): id is string => Boolean(id))),
    ];

    if (buyerIds.length > 0) {
      await sendPushToUsers(buyerIds, {
        title: "Tu evento arranca pronto",
        body: `${event.nombre} empieza en menos de ${REMINDER_WINDOW_HOURS} horas.`,
        data: { url: "/tickets" },
      });
    }

    await admin
      .from("events")
      .update({ reminder_sent_at: now.toISOString() })
      .eq("id", event.id);

    remindedEvents += 1;
  }

  return NextResponse.json({ remindedEvents });
}
