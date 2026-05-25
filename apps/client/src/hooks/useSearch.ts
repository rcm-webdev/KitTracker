// client/src/hooks/useSearch.ts
import { useQuery } from "@tanstack/react-query";
import { apiFetchJson } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";
import type { SearchResult } from "@strawhats/shared";

export function useSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: () =>
      apiFetchJson<SearchResult[]>(
        `/api/search?q=${encodeURIComponent(query)}`
      ),
    enabled: query.trim().length > 0,
  });
}
