import { useQuery } from "@tanstack/react-query";
import type { AppUser, UserPermissions } from "@strawhats/shared";
import { apiFetchJson } from "../lib/api";
import { useSession } from "../lib/auth-client";

export interface MeResponse extends AppUser {
  permissions: UserPermissions;
}

export function useMe() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetchJson<MeResponse>("/api/me"),
    enabled: Boolean(session?.user),
  });
}
