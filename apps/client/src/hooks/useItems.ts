// client/src/hooks/useItems.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiFetchJson } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";
import type { Item } from "@strawhats/shared";

export function useAddItem(binId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      apiFetchJson<Item>(`/api/bins/${binId}/items`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bins.detail(binId) });
    },
  });
}

export function useDeleteItem(binId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) =>
      apiFetch(`/api/items/${itemId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bins.detail(binId) });
    },
  });
}
