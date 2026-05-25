// client/src/hooks/useAdminUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetchJson } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";
import type { AdminUser } from "@strawhats/shared";

export function useAdminUsers() {
  return useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: () => apiFetchJson<AdminUser[]>("/api/admin/users"),
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, banned }: { id: string; banned: boolean | null }) =>
      apiFetchJson<void>(
        `/api/admin/users/${id}/${banned ? "unban" : "ban"}`,
        { method: "POST" }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetchJson<void>(`/api/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
    },
  });
}
