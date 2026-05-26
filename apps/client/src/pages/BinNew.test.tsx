import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { toast } from "sonner";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/msw/server";
import { mockBin } from "@/test/msw/handlers";
import BinNew from "./BinNew";

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

describe("BinNew", () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
  });

  it("shows error message when create fails", async () => {
    server.use(
      http.post("/api/bins", () =>
        HttpResponse.json({ error: "Name is required" }, { status: 400 })
      )
    );
    const user = userEvent.setup();
    renderWithProviders(<BinNew />);

    await user.type(screen.getByLabelText(/kit name/i), "My Kit");
    await user.type(screen.getByLabelText(/location/i), "OR 1");
    await user.click(screen.getByRole("button", { name: /create kit/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("submit button is disabled while mutation is in-flight", async () => {
    server.use(
      http.post("/api/bins", async () => {
        await new Promise((r) => setTimeout(r, 200));
        return HttpResponse.json(mockBin, { status: 201 });
      })
    );
    const user = userEvent.setup();
    renderWithProviders(<BinNew />);

    await user.type(screen.getByLabelText(/kit name/i), "My Kit");
    await user.type(screen.getByLabelText(/location/i), "OR 1");
    await user.click(screen.getByRole("button", { name: /create kit/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /creating/i })).toBeDisabled();
    });
  });

  it("fires a success toast when kit is created", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BinNew />);

    await user.type(screen.getByLabelText(/kit name/i), "My Kit");
    await user.type(screen.getByLabelText(/location/i), "OR 1");
    await user.click(screen.getByRole("button", { name: /create kit/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Kit created");
    });
  });
});
