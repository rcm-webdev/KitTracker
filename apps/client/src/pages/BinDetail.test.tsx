import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { toast } from "sonner";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/msw/server";
import { mockBin, mockItem } from "@/test/msw/handlers";
import BinDetail from "./BinDetail";

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return { ...actual, useParams: () => ({ id: "bin-1" }) };
});

vi.mock("@/hooks/useMe", () => ({
  useMe: () => ({
    data: {
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
      permissions: {
        canCreateKits: true,
        canEditKits: true,
        canViewDashboard: true,
        canSearch: true,
        scanOnly: false,
        isKiosk: false,
      },
    },
    isPending: false,
  }),
}));

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
      expect(screen.getByText(/supply list \(0\)/i)).toBeInTheDocument();
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

    await waitFor(() => screen.getByLabelText(/item name/i));
    await user.type(screen.getByLabelText(/item name/i), "New Item");
    await user.click(screen.getByRole("button", { name: /add item/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /adding/i })).toBeDisabled();
    });
  });

  it("fires a success toast when an item is added", async () => {
    server.use(
      http.get("/api/bins/:id", () => HttpResponse.json({ ...mockBin, items: [] })),
      http.post("/api/bins/:id/items", () => HttpResponse.json(mockItem, { status: 201 }))
    );
    const user = userEvent.setup();
    renderWithProviders(<BinDetail />);

    await waitFor(() => screen.getByLabelText(/item name/i));
    await user.type(screen.getByLabelText(/item name/i), "New Item");
    await user.click(screen.getByRole("button", { name: /add item/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Item added");
    });
  });

  it("fires a success toast when an item is removed", async () => {
    server.use(
      http.get("/api/bins/:id", () =>
        HttpResponse.json({ ...mockBin, items: [mockItem] })
      ),
      http.delete("/api/items/:id", () => new HttpResponse(null, { status: 204 }))
    );
    const user = userEvent.setup();
    renderWithProviders(<BinDetail />);

    await waitFor(() => screen.getByText("Test Item"));
    await user.click(screen.getByRole("button", { name: /remove test item/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Item removed");
    });
  });
});
