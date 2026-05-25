// client/src/lib/queryKeys.ts
export const queryKeys = {
  bins: {
    all: ["bins"] as const,
    filtered: (location: string) => ["bins", { location }] as const,
    detail: (id: string) => ["bins", id] as const,
  },
  search: (query: string) => ["search", query] as const,
  admin: {
    users: ["admin", "users"] as const,
  },
};
