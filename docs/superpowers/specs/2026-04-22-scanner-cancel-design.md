# Scanner Cancel & Loading State — Design Spec

## Context

The scanner page (`/scan`) had two UX problems:

1. **Blank page during camera init** — `setScanning(true)` was called immediately, hiding the "Initializing camera..." message before the camera was ready, leaving nothing visible on screen.
2. **No prominent cancel affordance** — the only exit was a small `← Back` text link at the top, easy to miss when a camera view fills the screen.

## Design

### Loading state

Two states track the scanner lifecycle:

- `initializing` — `true` from mount until `html5-qrcode.start()` resolves (camera live) or rejects (error). Shows "Starting camera..." while true.
- Cleared to `false` once the camera is ready or an error occurs.

This ensures the user always sees feedback while the camera warms up.

### Cancel button

- Replaces the `← Back` text link
- `<Button variant="outline">Cancel</Button>` (shadcn), centered below the scanner div
- Always visible: during loading, while scanning, and on error
- Navigates to `/dashboard` via `useNavigate`

### Error state

No change. Red error message renders correctly. Cancel button remains visible below it.

### StrictMode note

In development, React StrictMode's double-invoke causes `html5-qrcode` to log an `AbortError` from its internal `video.play()` call. This is a known library limitation, harmless, and does not occur in production builds. A comment in the component documents this.

## File Modified

- `client/src/pages/Scanner.tsx`

## Key decisions

- Used `Html5QrcodeScannerState` from `html5-qrcode` to check scanner state before calling `stop()` — more reliable than a manual boolean ref.
- Used a `cancelled` flag (local to each effect invocation) to handle the StrictMode race condition between `start()` resolving and cleanup running.
- Errors from `stop()` in the cancelled path are swallowed (`.catch(() => {})`) since they are StrictMode-only DOM noise.
