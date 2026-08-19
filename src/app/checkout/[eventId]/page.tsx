"use client";

import { useState, use } from "react";
import { Minus, Plus } from "lucide-react";

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
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-1">Checkout</h1>
      <p className="text-neutral-500 text-sm mb-6">
        Elegí cuántas entradas querés comprar.
      </p>

      <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-4 mb-6">
        <span className="font-medium">Cantidad</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            className="rounded-full border border-neutral-300 p-1.5 disabled:opacity-40"
            disabled={cantidad <= 1}
            aria-label="Restar"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-6 text-center font-semibold">{cantidad}</span>
          <button
            type="button"
            onClick={() => setCantidad((c) => Math.min(10, c + 1))}
            className="rounded-full border border-neutral-300 p-1.5 disabled:opacity-40"
            disabled={cantidad >= 10}
            aria-label="Sumar"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <button
        onClick={handlePagar}
        disabled={loading}
        className="w-full rounded-md bg-violet-600 text-white py-2.5 font-medium disabled:opacity-60"
      >
        {loading ? "Redirigiendo a MercadoPago..." : "Pagar con MercadoPago"}
      </button>
    </div>
  );
}
