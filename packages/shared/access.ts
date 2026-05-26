import type { ClinicProvider } from "./providers";

export type UserRole = "admin" | "lead" | "technician" | "kiosk";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  assignedProviders: string[];
}

export interface UserPermissions {
  canCreateKits: boolean;
  canEditKits: boolean;
  canViewDashboard: boolean;
  canSearch: boolean;
  scanOnly: boolean;
  isKiosk: boolean;
}

export function normalizeRole(role: string | null | undefined): UserRole {
  if (role === "admin" || role === "lead" || role === "technician" || role === "kiosk") {
    return role;
  }
  return "technician";
}

export function binMatchesAssignment(
  binProviderTags: string[],
  assignedProviders: string[]
): boolean {
  if (assignedProviders.length === 0) return false;
  return binProviderTags.some((tag) => assignedProviders.includes(tag));
}

export function permissionsFor(user: AppUser): UserPermissions {
  const role = normalizeRole(user.role);
  return {
    canCreateKits: role === "admin" || role === "lead",
    canEditKits: role === "admin" || role === "lead" || role === "technician",
    canViewDashboard: role !== "kiosk",
    canSearch: role !== "kiosk",
    scanOnly: role === "kiosk",
    isKiosk: role === "kiosk",
  };
}

export function canViewBin(
  user: AppUser,
  bin: { providerTags: string[] }
): boolean {
  const role = normalizeRole(user.role);
  if (role === "admin" || role === "kiosk") return true;
  return binMatchesAssignment(bin.providerTags ?? [], user.assignedProviders);
}

export function canMutateBin(
  user: AppUser,
  bin: { providerTags: string[] }
): boolean {
  const role = normalizeRole(user.role);
  if (role === "kiosk") return false;
  if (role === "admin") return true;
  if (role === "lead" || role === "technician") {
    return binMatchesAssignment(bin.providerTags ?? [], user.assignedProviders);
  }
  return false;
}

export function canCreateBin(user: AppUser, providerTags: string[]): boolean {
  const role = normalizeRole(user.role);
  if (role === "kiosk" || role === "technician") return false;
  if (role === "admin") return true;
  if (role === "lead") {
    if (providerTags.length === 0) return false;
    return providerTags.every((tag) =>
      user.assignedProviders.includes(tag as ClinicProvider)
    );
  }
  return false;
}
