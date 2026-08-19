import { NextResponse } from "next/server";
import { Preference } from "mercadopago";
import { getSellerMpConfig } from "@/lib/mercadopago";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const eventId = body?.eventId as string | undefined;
  const cantidad = Number(body?.cantidad ?? 1);

  if (!eventId || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > 10) {
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
    .select("id, nombre, precio, activo, stock_disponible, organizer_id")
    .eq("id", eventId)
    .single();

  if (!event || !event.activo) {
    return NextResponse.json({ error: "Evento no disponible" }, { status: 404 });
  }
  if (event.stock_disponible < cantidad) {
    return NextResponse.json({ error: "No hay suficiente stock" }, { status: 409 });
  }

  const { data: organizer } = await admin
    .from("profiles")
    .select("mp_access_token")
    .eq("id", event.organizer_id)
    .single();

  if (!organizer?.mp_access_token) {
    return NextResponse.json(
      { error: "El organizador todavía no conectó MercadoPago" },
      { status: 422 }
    );
  }

  const feePercentage = Number(process.env.MP_PLATFORM_FEE_PERCENTAGE ?? "5");
  const marketplaceFee =
    Math.round(event.precio * cantidad * (feePercentage / 100) * 100) / 100;

  const preference = new Preference(getSellerMpConfig(organizer.mp_access_token));

  try {
    const result = await preference.create({
      body: {
        items: [
          {
            id: event.id,
            title: event.nombre,
            quantity: cantidad,
            unit_price: event.precio,
            currency_id: "ARS",
          },
        ],
        marketplace_fee: marketplaceFee,
        metadata: {
          event_id: event.id,
          buyer_id: user.id,
          cantidad,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/tickets`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/tickets`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${event.id}`,
        },
        auto_return: "approved",
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
      },
    });

    // With TEST- platform credentials, buyers must go through the sandbox
    // checkout domain — the production one authenticates test users fine
    // but always fails right after, since it can't actually charge them.
    const isTestMode = (process.env.MP_ACCESS_TOKEN ?? "").startsWith("TEST-");
    const initPoint = isTestMode
      ? (result.sandbox_init_point ?? result.init_point)
      : (result.init_point ?? result.sandbox_init_point);

    return NextResponse.json({ init_point: initPoint });
  } catch (err) {
    console.error("MP create preference error", err);
    return NextResponse.json(
      { error: "No pudimos iniciar el pago. Intentá de nuevo." },
      { status: 502 }
    );
  }
}
