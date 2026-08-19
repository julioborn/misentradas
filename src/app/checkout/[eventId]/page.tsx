import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "./checkout-form";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/auth/login?redirect=${encodeURIComponent(`/checkout/${eventId}`)}`
    );
  }

  const { data: event } = await supabase
    .from("events")
    .select("organizer_id")
    .eq("id", eventId)
    .single();

  if (event?.organizer_id === user!.id) {
    redirect(`/organizer/events/${eventId}/manual`);
  }

  return (
    <div className="py-6">
      <p className="font-mono text-xs tracking-[0.3em] text-violet uppercase mb-2">
        Paso final
      </p>
      <h1 className="font-display text-3xl uppercase tracking-wide mb-1">
        Checkout
      </h1>
      <p className="text-haze text-sm mb-6">
        Elegí cuántas entradas querés comprar.
      </p>

      <CheckoutForm eventId={eventId} />
    </div>
  );
}
