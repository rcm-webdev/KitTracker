import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/msw/server";
import Search from "./Search";
import type { SearchResult } from "@strawhats/shared";

describe("Search", () => {
  it("shows no results message when query returns empty array", async () => {
    renderWithProviders(<Search />, { initialEntries: ["/search?q=notfound"] });
    await waitFor(() => {
      expect(screen.getByText(/no items found/i)).toBeInTheDocument();
    });
  });

  it("shows error message when search API returns 500", async () => {
    server.use(
      http.get("/api/search", () =>
        HttpResponse.json({ error: "Server error" }, { status: 500 })
      )
    );
    renderWithProviders(<Search />, { initialEntries: ["/search?q=hammer"] });
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("renders each result's item name and bin location", async () => {
    const results: SearchResult[] = [
      {
        item: { id: "item-1", binId: "bin-1", name: "Hammer", description: null, createdAt: "2026-01-01T00:00:00.000Z" },
        binName: "Tool Bin",
        binLocation: "Garage",
        binId: "bin-1",
      },
    ];
    server.use(http.get("/api/search", () => HttpResponse.json(results)));
    renderWithProviders(<Search />, { initialEntries: ["/search?q=hammer"] });
    await waitFor(() => {
      expect(screen.getByText("Hammer")).toBeInTheDocument();
      expect(screen.getByText(/Garage/)).toBeInTheDocument();
    });
  });

  it("does not fire a network request when query is empty", async () => {
    const handler = vi.fn(() => HttpResponse.json([]));
    server.use(http.get("/api/search", handler));
    renderWithProviders(<Search />, { initialEntries: ["/search"] });

    // Wait a tick to let any potential request resolve
    await new Promise((r) => setTimeout(r, 50));
    expect(handler).not.toHaveBeenCalled();
  });

  it("submits search when form is submitted", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Search />, { initialEntries: ["/search"] });

    await user.type(screen.getByPlaceholderText(/search by item name/i), "wrench");
    await user.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/no items found/i)).toBeInTheDocument();
    });
  });
});
