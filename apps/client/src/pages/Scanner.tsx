import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { Button } from "@/components/ui/button";

const SCANNER_ID = "qr-scanner-container";

// Note: In development, React StrictMode causes html5-qrcode to log an AbortError
// from its internal video.play() call during the double-invoke cycle. This is
// harmless and does not occur in production builds.

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
        { facingMode: "environment" }, // rear camera
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Stop scanning once we have a result
          scanner.stop().catch(console.error);

          // Extract path from the scanned URL
          try {
            const url = new URL(decodedText);
            // Navigate to the path component (e.g. /bins/abc-123)
            navigate(url.pathname);
          } catch {
            // If it's already just a path, navigate directly
            if (decodedText.startsWith("/bins/")) {
              navigate(decodedText);
            } else {
              setError(`Unrecognized QR code: ${decodedText}`);
            }
          }
        },
        undefined // ignore per-frame errors
      )
      .then(() => {
        if (cancelled) {
          // Cleanup already ran before start resolved — stop immediately.
          // Swallow errors: html5-qrcode may throw DOM errors in StrictMode.
          scanner.stop().catch(() => {});
          return;
        }
        setInitializing(false);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(`Camera error: ${err.message}. Make sure camera permissions are granted.`);
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
    <div style={{ maxWidth: 500, margin: "40px auto", padding: "0 16px" }}>
      <h1>Scan QR Code</h1>
      <p style={{ color: "#666" }}>Point your camera at a bin QR code label.</p>

      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}

      {initializing && !error && <p>Starting camera...</p>}

      {/* html5-qrcode renders into this div */}
      <div id={SCANNER_ID} style={{ width: "100%" }} />

      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
