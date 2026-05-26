// client/src/lib/queryKeys.ts
export const queryKeys = {
  bins: {
    all: ["bins"] as const,
    list: (filters?: { location?: string; provider?: string }) =>
      filters?.location || filters?.provider
        ? (["bins", filters] as const)
        : queryKeys.bins.all,
    detail: (id: string) => ["bins", id] as const,
    providers: ["bins", "providers"] as const,
  },
  search: (query: string) => ["search", query] as const,
  admin: {
    users: ["admin", "users"] as const,
  },
};
