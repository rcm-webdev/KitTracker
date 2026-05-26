import { useQuery } from "@tanstack/react-query";
import type { PublicBin } from "@kittracker/shared";
import { apiFetchJson } from "../lib/api";

export function usePublicKit(id: string) {
  return useQuery({
    queryKey: ["publicKit", id],
    queryFn: () => apiFetchJson<PublicBin>(`/api/public/bins/${id}`),
    enabled: Boolean(id),
  });
}
