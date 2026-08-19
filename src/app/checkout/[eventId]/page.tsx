"use client";

import { useState, use } from "react";
import { Loader2, Minus, Plus } from "lucide-react";
import { TicketStub } from "@/components/ticket-stub";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePagar() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, cantidad }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No pudimos iniciar el pago.");
        setLoading(false);
        return;
      }

      window.location.href = data.init_point;
    } catch {
      setError("No pudimos iniciar el pago. Intentá de nuevo.");
      setLoading(false);
    }
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

      <TicketStub className="mb-6">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-haze">
            Cantidad
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
              className="rounded-full border border-white/15 p-1.5 disabled:opacity-40"
              disabled={cantidad <= 1}
              aria-label="Restar"
            >
              <Minus className="size-4" />
            </button>
            <span className="font-mono w-6 text-center text-lg">{cantidad}</span>
            <button
              type="button"
              onClick={() => setCantidad((c) => Math.min(10, c + 1))}
              className="rounded-full border border-white/15 p-1.5 disabled:opacity-40"
              disabled={cantidad >= 10}
              aria-label="Sumar"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </TicketStub>

      {error && <p className="text-sm text-violet mb-4">{error}</p>}

      <button
        onClick={handlePagar}
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full rounded-full bg-violet text-ink py-2.5 font-semibold disabled:opacity-60"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        {loading ? "Redirigiendo a MercadoPago..." : "Pagar con MercadoPago"}
      </button>
    </div>
  );
}
