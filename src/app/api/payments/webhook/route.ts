import { NextResponse } from "next/server";
import {
  Payment,
  WebhookSignatureValidator,
  InvalidWebhookSignatureError,
} from "mercadopago";
import { getPlatformMpConfig } from "@/lib/mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";

type PaymentMetadata = {
  event_id?: string;
  buyer_id?: string;
  cantidad?: number;
};

export async function POST(request: Request) {
  const url = new URL(request.url);
  const body = await request.json().catch(() => null);
  const paymentId = body?.data?.id ?? url.searchParams.get("data.id");

  if (!paymentId) {
    return NextResponse.json({ received: true });
  }

  const secret = process.env.MP_WEBHOOK_SECRET;
  if (secret) {
    try {
      WebhookSignatureValidator.validate({
        xSignature: request.headers.get("x-signature"),
        xRequestId: request.headers.get("x-request-id"),
        dataId: url.searchParams.get("data.id") ?? String(paymentId),
        secret,
        toleranceSeconds: 300,
      });
    } catch (err) {
      if (err instanceof InvalidWebhookSignatureError) {
        console.error("MP webhook: invalid signature", err.reason);
      }
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
  } else {
    console.warn(
      "MP_WEBHOOK_SECRET no configurado: la notificación no se está validando."
    );
  }

  const admin = createAdminClient();

  try {
    const payment = new Payment(getPlatformMpConfig());
    const result = await payment.get({ id: String(paymentId) });

    if (result.status !== "approved") {
      return NextResponse.json({ received: true });
    }

    const { data: existing } = await admin
      .from("payments")
      .select("id")
      .eq("mp_payment_id", String(result.id))
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ received: true });
    }

    const metadata = (result.metadata ?? {}) as PaymentMetadata;

    if (!metadata.event_id || !metadata.buyer_id || !metadata.cantidad) {
      console.error("MP webhook: metadata incompleta", metadata);
      return NextResponse.json({ received: true });
    }

    const { data: event } = await admin
      .from("events")
      .select("id, precio, stock_disponible")
      .eq("id", metadata.event_id)
      .single();

    if (!event) {
      return NextResponse.json({ received: true });
    }

    const feePercentage = Number(process.env.MP_PLATFORM_FEE_PERCENTAGE ?? "5");
    const unitFee = Math.round(event.precio * (feePercentage / 100) * 100) / 100;
    const unitOrganizerAmount = Math.round((event.precio - unitFee) * 100) / 100;

    for (let i = 0; i < metadata.cantidad; i++) {
      const { data: ticket } = await admin
        .from("tickets")
        .insert({
          event_id: metadata.event_id,
          buyer_id: metadata.buyer_id,
          estado: "confirmed",
          metodo_pago: "mercadopago",
          mp_payment_id: String(result.id),
        })
        .select("id")
        .single();

      if (ticket) {
        await admin.from("payments").insert({
          ticket_id: ticket.id,
          amount: event.precio,
          platform_fee: unitFee,
          organizer_amount: unitOrganizerAmount,
          mp_payment_id: String(result.id),
          estado: "approved",
        });
      }
    }

    await admin
      .from("events")
      .update({
        stock_disponible: Math.max(event.stock_disponible - metadata.cantidad, 0),
      })
      .eq("id", metadata.event_id);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("MP webhook error", err);
    return NextResponse.json({ received: true });
  }
}
