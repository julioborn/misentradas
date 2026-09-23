"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

type ScanResult = {
  valid: boolean;
  message?: string;
  buyerName?: string | null;
};

export function Scanner({ eventId }: { eventId: string }) {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isNative, setIsNative] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const checkingRef = useRef(false);
  const lastCodeRef = useRef<string | null>(null);
  const lastCodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    let listenerHandle: { remove: () => void } | null = null;
    let scannerModule: typeof import("@capacitor-mlkit/barcode-scanning") | null =
      null;

    async function handleScan(rawValue: string) {
      if (checkingRef.current || rawValue === lastCodeRef.current) return;
      checkingRef.current = true;
      lastCodeRef.current = rawValue;

      try {
        const res = await fetch("/api/tickets/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, qrCode: rawValue }),
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

    async function start() {
      try {
        const { Capacitor } = await import("@capacitor/core");
        const mod = await import("@capacitor-mlkit/barcode-scanning");
        const { BarcodeFormat, BarcodeScanner } = mod;
        scannerModule = mod;
        if (cancelled) return;

        const native = Capacitor.isNativePlatform();
        setIsNative(native);

        const { camera } = await BarcodeScanner.requestPermissions();
        if (cancelled) return;

        if (camera !== "granted" && camera !== "limited") {
          setCameraError(
            "No tenés permiso de cámara. Habilitalo en los ajustes del sistema e intentá de nuevo."
          );
          return;
        }

        listenerHandle = await BarcodeScanner.addListener(
          "barcodesScanned",
          (event) => {
            const value = event.barcodes[0]?.rawValue;
            if (value) handleScan(value);
          }
        );

        if (native) {
          document.body.classList.add("barcode-scanner-active");
        }

        await BarcodeScanner.startScan({
          formats: [BarcodeFormat.QrCode],
          videoElement: native ? undefined : (videoRef.current ?? undefined),
        });
      } catch {
        if (!cancelled) {
          setCameraError(
            "No pudimos acceder a la cámara. Revisá los permisos e intentá de nuevo."
          );
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      if (lastCodeTimerRef.current) clearTimeout(lastCodeTimerRef.current);
      listenerHandle?.remove();
      scannerModule?.BarcodeScanner.stopScan().catch(() => {});
      document.body.classList.remove("barcode-scanner-active");
    };
  }, [eventId]);

  return (
    <div className="barcode-scanner-modal flex flex-col items-center">
      <div
        className={`w-full aspect-square rounded-2xl overflow-hidden border border-white/10 relative ${
          isNative ? "bg-transparent" : "bg-surface"
        }`}
      >
        {!isNative && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
            autoPlay
          />
        )}
        {!cameraError && (
          <div className="absolute inset-6 rounded-xl border-2 border-violet/60 pointer-events-none" />
        )}
        {cameraError && (
          <p className="absolute inset-0 flex items-center justify-center bg-surface text-sm text-violet text-center px-4">
            {cameraError}
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
