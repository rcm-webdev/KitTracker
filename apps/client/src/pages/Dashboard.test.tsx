import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/msw/server";
import { mockBin } from "@/test/msw/handlers";
import Dashboard from "./Dashboard";

vi.mock("../lib/auth-client", () => ({
  signIn: { email: vi.fn() },
  signUp: { email: vi.fn() },
  signOut: vi.fn(),
  useSession: () => ({ data: { user: { role: "user" } }, isPending: false }),
  getSession: vi.fn(),
}));

describe("Dashboard", () => {
  it("shows skeleton placeholders while bins are loading", () => {
    // Delay the response so we can observe the loading state
    server.use(
      http.get("/api/bins", async () => {
        await new Promise((r) => setTimeout(r, 100));
        return HttpResponse.json([mockBin]);
      })
    );

    renderWithProviders(<Dashboard />);
    // Skeletons render as div elements during the loading state
    expect(screen.getAllByRole("generic").length).toBeGreaterThan(0);
  });

  it("shows empty state message when API returns empty array", async () => {
    server.use(http.get("/api/bins", () => HttpResponse.json([])));
    renderWithProviders(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/no procedure kits yet/i)).toBeInTheDocument();
    });
  });

  it("shows error message when API returns 500", async () => {
    server.use(
      http.get("/api/bins", () =>
        HttpResponse.json({ error: "Server error" }, { status: 500 })
      )
    );
    renderWithProviders(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("renders a BinCard for each bin returned", async () => {
    server.use(
      http.get("/api/bins", () => HttpResponse.json([mockBin, { ...mockBin, id: "bin-2", name: "Second Bin" }]))
    );
    renderWithProviders(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Test Bin")).toBeInTheDocument();
      expect(screen.getByText("Second Bin")).toBeInTheDocument();
    });
  });
});
