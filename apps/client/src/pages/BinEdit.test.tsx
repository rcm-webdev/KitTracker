import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { toast } from "sonner";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/msw/server";
import { mockBin } from "@/test/msw/handlers";
import BinEdit from "./BinEdit";

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return { ...actual, useParams: () => ({ id: "bin-1" }) };
});

describe("BinEdit", () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
  });

  it("pre-populates name, location, description from fetched bin data", async () => {
    renderWithProviders(<BinEdit />);
    await waitFor(() => {
      expect(screen.getByLabelText(/kit name/i)).toHaveValue(mockBin.name);
      expect(screen.getByLabelText(/room \/ location/i)).toHaveValue(mockBin.location);
      expect(screen.getByLabelText(/notes/i)).toHaveValue(mockBin.description ?? "");
    });
  });

  it("shows error message when update fails", async () => {
    server.use(
      http.put("/api/bins/:id", () =>
        HttpResponse.json({ error: "Update failed" }, { status: 400 })
      )
    );
    const user = userEvent.setup();
    renderWithProviders(<BinEdit />);

    await waitFor(() => screen.getByLabelText(/kit name/i));
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("submit button is disabled while mutation is in-flight", async () => {
    server.use(
      http.put("/api/bins/:id", async () => {
        await new Promise((r) => setTimeout(r, 200));
        return HttpResponse.json(mockBin);
      })
    );
    const user = userEvent.setup();
    renderWithProviders(<BinEdit />);

    await waitFor(() => screen.getByLabelText(/kit name/i));
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
    });
  });

  it("fires a success toast when kit is saved", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BinEdit />);

    await waitFor(() => screen.getByLabelText(/kit name/i));
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Changes saved");
    });
  });
});
