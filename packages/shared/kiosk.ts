/** Shared clinic tablet login for QR scan follow-up (staff mode). */
export const KIOSK_USER = {
  email: "tablet@kittracker.clinic",
  /** Default PIN (8+ chars for Better Auth); override via KIOSK_PIN when seeding. */
  password: "88888888",
  displayName: "Clinic Tablet",
} as const;

/** URL path segment for public kit pages (encoded in QR labels). */
export function publicKitPath(binId: string): string {
  return `/k/${binId}`;
}
