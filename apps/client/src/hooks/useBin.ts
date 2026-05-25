// client/src/hooks/useBin.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetchJson } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";
import type { Bin } from "@strawhats/shared";

export function useBin(id: string) {
  return useQuery({
    queryKey: queryKeys.bins.detail(id),
    queryFn: () => apiFetchJson<Bin>(`/api/bins/${id}`),
  });
}

export function useUpdateBin(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; location: string; description: string | null }) =>
      apiFetchJson<Bin>(`/api/bins/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bins.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bins.all });
    },
  });
}
