"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

type ScanResult = {
  valid: boolean;
  message?: string;
  buyerName?: string | null;
};

type BarcodeDetectorLike = {
  detect(source: CanvasImageSource): Promise<Array<{ rawValue: string }>>;
};

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats: string[] }) => BarcodeDetectorLike;
  }
}

export function Scanner({ eventId }: { eventId: string }) {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const checkingRef = useRef(false);
  const lastCodeRef = useRef<string | null>(null);
  const lastCodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

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
        // Safari (iOS and macOS) never shipped the native BarcodeDetector
        // API, so this loads a WASM polyfill there; Chrome/Android already
        // has it built in and this import is a no-op.
        if (!("BarcodeDetector" in window)) {
          await import("barcode-detector/polyfill");
        }
        if (cancelled) return;

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const detector = new window.BarcodeDetector!({ formats: ["qr_code"] });
        intervalId = setInterval(async () => {
          if (checkingRef.current) return;
          try {
            const barcodes = await detector.detect(video);
            const value = barcodes[0]?.rawValue;
            if (value) handleScan(value);
          } catch {
            // Transient decode errors (e.g. blurry frame) are expected; ignore and retry.
          }
        }, 400);
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
      if (intervalId) clearInterval(intervalId);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [eventId]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full aspect-square rounded-2xl overflow-hidden border border-white/10 relative bg-surface">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
          autoPlay
        />
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
