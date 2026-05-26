export { CLINIC_PROVIDERS, type ClinicProvider } from "./providers";
export { DEMO_USER, DEMO_TECHNICIAN, DEMO_PROCEDURE_KITS } from "./demo";
export { KIOSK_USER, publicKitPath } from "./kiosk";
export {
  normalizeRole,
  permissionsFor,
  canViewBin,
  canMutateBin,
  canCreateBin,
  binMatchesAssignment,
  type UserRole,
  type AppUser,
  type UserPermissions,
} from "./access";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "lead" | "technician" | "kiosk";
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | null;
  banned: boolean | null;
  createdAt: string;
  binCount: number;
  itemCount: number;
}

export interface Bin {
  id: string;
  userId: string;
  name: string;
  location: string;
  description: string | null;
  providerTags: string[];
  createdAt: string;
  updatedAt: string;
  items?: Item[];
}

/** Read-only kit snapshot for unauthenticated QR scans (no owner id). */
export type PublicBin = Omit<Bin, "userId">;

export interface Item {
  id: string;
  binId: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface SearchResult {
  item: Item;
  binName: string;
  binLocation: string;
  binId: string;
}

export interface ApiError {
  error: string;
}
