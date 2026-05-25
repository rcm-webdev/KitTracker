// client/src/hooks/useBins.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetchJson } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";
import type { Bin } from "@strawhats/shared";

export function useBins(location?: string) {
  return useQuery({
    queryKey: location ? queryKeys.bins.filtered(location) : queryKeys.bins.all,
    queryFn: () => {
      const params = new URLSearchParams();
      if (location) params.set("location", location);
      return apiFetchJson<Bin[]>(`/api/bins?${params.toString()}`);
    },
  });
}

export function useCreateBin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; location: string; description?: string }) =>
      apiFetchJson<Bin>("/api/bins", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bins.all });
    },
  });
}
