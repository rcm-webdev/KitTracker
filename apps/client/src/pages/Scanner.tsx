import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { Button } from "@/components/ui/button";

const SCANNER_ID = "qr-scanner-container";

function binPathFromScan(decodedText: string): string | null {
  try {
    const url = new URL(decodedText);
    if (url.pathname.startsWith("/k/")) {
      return url.pathname;
    }
    if (url.pathname.startsWith("/bins/")) {
      return `${url.pathname}?scanned=1`;
    }
  } catch {
    if (decodedText.startsWith("/k/")) {
      return decodedText.split("?")[0] ?? decodedText;
    }
    if (decodedText.startsWith("/bins/")) {
      return `${decodedText}?scanned=1`;
    }
  }
  return null;
}

export default function Scanner() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let cancelled = false;
    const scanner = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          scanner.stop().catch(console.error);

          const path = binPathFromScan(decodedText);
          if (path) {
            navigate(path);
          } else {
            setError(`Unrecognized QR code: ${decodedText}`);
          }
        },
        undefined
      )
      .then(() => {
        if (cancelled) {
          scanner.stop().catch(() => {});
          return;
        }
        setInitializing(false);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(
            `Camera error: ${err.message}. Make sure camera permissions are granted.`
          );
          setInitializing(false);
        }
      });

    return () => {
      cancelled = true;
      const state = scanner.getState();
      if (
        state === Html5QrcodeScannerState.SCANNING ||
        state === Html5QrcodeScannerState.PAUSED
      ) {
        scanner.stop().catch(() => {});
      }
    };
  }, [navigate]);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-lg font-semibold">Scan kit QR</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Point the camera at a procedure kit label. You will land on the full
        supply list so techs can prep the room with confidence.
      </p>

      {error && (
        <p role="alert" className="mt-4 text-xs text-destructive">
          {error}
        </p>
      )}

      {initializing && !error && (
        <p className="mt-4 text-xs text-muted-foreground">Starting camera...</p>
      )}

      <div id={SCANNER_ID} className="mt-4 w-full" />

      <div className="mt-4 flex justify-center">
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
