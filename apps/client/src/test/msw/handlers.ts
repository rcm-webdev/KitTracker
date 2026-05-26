import { http, HttpResponse } from "msw";
import {
  permissionsFor,
  type Bin,
  type Item,
  type AdminUser,
  type SearchResult,
  type PublicBin,
  type AppUser,
} from "@strawhats/shared";

export const mockBin: Bin = {
  id: "bin-1",
  userId: "user-1",
  name: "Test Bin",
  location: "Garage",
  description: "A test bin",
  providerTags: ["Dr. Eye"],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  items: [],
};

export const mockItem: Item = {
  id: "item-1",
  binId: "bin-1",
  name: "Test Item",
  description: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

export const mockAdminUser: AdminUser = {
  id: "user-2",
  email: "other@example.com",
  name: "Other User",
  role: "user",
  banned: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  binCount: 2,
  itemCount: 5,
};

export const mockSession = {
  user: {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    role: "lead",
    assignedProviders: ["Dr. Eye"],
    emailVerified: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  session: {
    id: "session-1",
    userId: "user-1",
    token: "test-token",
    expiresAt: "2026-12-31T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
};

const mockAppUser: AppUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  role: "lead",
  assignedProviders: [
    "Dr. Eye",
    "Dr. Eye2",
    "Dr. Eye3",
    "Dr. Eye4",
    "Dr. Eye5",
    "Dr. Eye6",
    "Dr. Eye7",
    "Dr. Eye8",
  ],
};

export const handlers = [
  http.get("/api/auth/get-session", () => HttpResponse.json(mockSession)),

  http.get("/api/me", () =>
    HttpResponse.json({
      ...mockAppUser,
      permissions: permissionsFor(mockAppUser),
    })
  ),

  http.get("/api/bins/providers", () =>
    HttpResponse.json([
      "Dr. Eye",
      "Dr. Eye2",
      "Dr. Eye3",
      "Dr. Eye4",
      "Dr. Eye5",
      "Dr. Eye6",
      "Dr. Eye7",
      "Dr. Eye8",
    ])
  ),
  http.get("/api/bins", () => HttpResponse.json([mockBin])),
  http.post("/api/bins", () => HttpResponse.json(mockBin, { status: 201 })),
  http.get("/api/bins/:id", () => HttpResponse.json(mockBin)),
  http.get("/api/public/bins/:id", () => {
    const { userId: _userId, ...publicBin } = mockBin;
    return HttpResponse.json(publicBin satisfies PublicBin);
  }),
  http.put("/api/bins/:id", () => HttpResponse.json(mockBin)),
  http.delete("/api/bins/:id", () => new HttpResponse(null, { status: 204 })),

  http.post("/api/bins/:binId/items", () =>
    HttpResponse.json(mockItem, { status: 201 })
  ),
  http.delete("/api/items/:id", () => new HttpResponse(null, { status: 204 })),

  http.get("/api/search", () => {
    const results: SearchResult[] = [];
    return HttpResponse.json(results);
  }),

  http.get("/api/admin/users", () => HttpResponse.json([mockAdminUser])),
  http.post("/api/admin/users/:id/ban", () => new HttpResponse(null, { status: 200 })),
  http.post("/api/admin/users/:id/unban", () => new HttpResponse(null, { status: 200 })),
  http.delete("/api/admin/users/:id", () => new HttpResponse(null, { status: 204 })),
];
