import {
  canCreateBin,
  canMutateBin,
  canViewBin,
  normalizeRole,
  type AppUser,
} from "@strawhats/shared";
import type { AuthenticatedRequest } from "../middleware/requireAuth";

export function toAppUser(user: AuthenticatedRequest["user"]): AppUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: normalizeRole(user.role),
    assignedProviders: user.assignedProviders ?? [],
  };
}

export { canCreateBin, canMutateBin, canViewBin };
