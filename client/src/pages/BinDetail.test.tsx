import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/msw/server";
import { mockBin, mockItem } from "@/test/msw/handlers";
import BinDetail from "./BinDetail";

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return { ...actual, useParams: () => ({ id: "bin-1" }) };
});

describe("BinDetail", () => {
  it("shows nothing (null) while bin is loading", () => {
    server.use(
      http.get("/api/bins/:id", async () => {
        await new Promise((r) => setTimeout(r, 200));
        return HttpResponse.json(mockBin);
      })
    );
    const { container } = renderWithProviders(<BinDetail />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows error message when bin fetch fails", async () => {
    server.use(
      http.get("/api/bins/:id", () =>
        HttpResponse.json({ error: "Not found" }, { status: 404 })
      )
    );
    renderWithProviders(<BinDetail />);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("shows empty items message when bin has no items", async () => {
    server.use(
      http.get("/api/bins/:id", () => HttpResponse.json({ ...mockBin, items: [] }))
    );
    renderWithProviders(<BinDetail />);
    await waitFor(() => {
      expect(screen.getByText(/items \(0\)/i)).toBeInTheDocument();
    });
  });

  it("renders each item name in the list", async () => {
    server.use(
      http.get("/api/bins/:id", () =>
        HttpResponse.json({
          ...mockBin,
          items: [
            mockItem,
            { ...mockItem, id: "item-2", name: "Second Item" },
          ],
        })
      )
    );
    renderWithProviders(<BinDetail />);
    await waitFor(() => {
      expect(screen.getByText("Test Item")).toBeInTheDocument();
      expect(screen.getByText("Second Item")).toBeInTheDocument();
    });
  });

  it("add button is disabled while mutation is in-flight", async () => {
    server.use(
      http.get("/api/bins/:id", () => HttpResponse.json({ ...mockBin, items: [] })),
      http.post("/api/bins/:id/items", async () => {
        await new Promise((r) => setTimeout(r, 200));
        return HttpResponse.json(mockItem, { status: 201 });
      })
    );
    const user = userEvent.setup();
    renderWithProviders(<BinDetail />);

    await waitFor(() => screen.getByPlaceholderText("Item name"));
    await user.type(screen.getByPlaceholderText("Item name"), "New Item");
    await user.click(screen.getByRole("button", { name: /^add$/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /adding/i })).toBeDisabled();
    });
  });
});
