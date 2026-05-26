import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetchJson } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";
import type { Bin } from "@kittracker/shared";

export type BinListFilters = {
  location?: string;
  provider?: string;
};

export function useBins(filters?: BinListFilters) {
  return useQuery({
    queryKey: queryKeys.bins.list(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.location) params.set("location", filters.location);
      if (filters?.provider) params.set("provider", filters.provider);
      const qs = params.toString();
      return apiFetchJson<Bin[]>(`/api/bins${qs ? `?${qs}` : ""}`);
    },
  });
}

export function useBinProviders() {
  return useQuery({
    queryKey: queryKeys.bins.providers,
    queryFn: () => apiFetchJson<string[]>("/api/bins/providers"),
  });
}

export function useCreateBin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      location: string;
      description?: string;
      providerTags?: string[];
    }) =>
      apiFetchJson<Bin>("/api/bins", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bins.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bins.providers });
    },
  });
}
