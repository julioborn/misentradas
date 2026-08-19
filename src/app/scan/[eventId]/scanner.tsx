"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

const REGION_ID = "qr-reader-region";

type ScanResult = {
  valid: boolean;
  message?: string;
  buyerName?: string | null;
};

export function Scanner({ eventId }: { eventId: string }) {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const checkingRef = useRef(false);
  const lastCodeRef = useRef<string | null>(null);
  const lastCodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    let scannerInstance: import("html5-qrcode").Html5Qrcode | null = null;

    async function start() {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;

      const scanner = new Html5Qrcode(REGION_ID);
      scannerInstance = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          handleScan,
          undefined
        );
      } catch {
        if (!cancelled) setCameraError(true);
      }
    }

    async function handleScan(decodedText: string) {
      if (checkingRef.current || decodedText === lastCodeRef.current) return;
      checkingRef.current = true;
      lastCodeRef.current = decodedText;

      try {
        const res = await fetch("/api/tickets/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, qrCode: decodedText }),
        });
        const data = await res.json();
        setResult(
          res.ok
            ? data
            : { valid: false, message: data.error ?? "No pudimos validar." }
        );
      } catch {
        setResult({ valid: false, message: "Error de red. Intentá de nuevo." });
      } finally {
        checkingRef.current = false;
        if (lastCodeTimerRef.current) clearTimeout(lastCodeTimerRef.current);
        lastCodeTimerRef.current = setTimeout(() => {
          lastCodeRef.current = null;
        }, 2500);
      }
    }

    start();

    return () => {
      cancelled = true;
      if (lastCodeTimerRef.current) clearTimeout(lastCodeTimerRef.current);
      if (scannerInstance) {
        scannerInstance
          .stop()
          .catch(() => {})
          .finally(() => scannerInstance?.clear());
      }
    };
  }, [eventId]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full rounded-2xl overflow-hidden bg-surface border border-white/10">
        <div id={REGION_ID} className="w-full" />
        {cameraError && (
          <p className="text-sm text-violet text-center px-4 py-8">
            No pudimos acceder a la cámara. Revisá los permisos del navegador
            e intentá de nuevo.
          </p>
        )}
      </div>

      <div className="w-full mt-4 min-h-24">
        {result ? (
          <div
            className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${
              result.valid
                ? "border-lime/30 bg-lime/10"
                : "border-violet/30 bg-violet/10"
            }`}
          >
            {result.valid ? (
              <CheckCircle2 className="size-6 text-lime shrink-0" />
            ) : (
              <XCircle className="size-6 text-violet shrink-0" />
            )}
            <div className="min-w-0">
              <p
                className={`font-display uppercase tracking-wide ${
                  result.valid ? "text-lime" : "text-violet"
                }`}
              >
                {result.valid ? "Entrada válida" : "Entrada inválida"}
              </p>
              {result.valid && result.buyerName && (
                <p className="text-sm text-paper truncate">{result.buyerName}</p>
              )}
              {!result.valid && result.message && (
                <p className="text-sm text-haze truncate">{result.message}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-haze py-3">
            <Loader2 className="size-4 animate-spin" />
            Apuntá la cámara al QR de la entrada
          </div>
        )}
      </div>
    </div>
  );
}
