import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/msw/server";
import { mockBin } from "@/test/msw/handlers";
import PublicKit from "./PublicKit";

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return { ...actual, useParams: () => ({ id: "bin-1" }) };
});

vi.mock("@/lib/auth-client", () => ({
  signIn: {
    email: vi.fn(async () => ({ data: { user: { role: "user" } }, error: null })),
  },
}));

describe("PublicKit", () => {
  it("renders kit name and supplies without signing in", async () => {
    server.use(
      http.get("/api/public/bins/:id", () =>
        HttpResponse.json({
          ...mockBin,
          items: [
            {
              id: "item-1",
              binId: "bin-1",
              name: "BSS",
              description: null,
              createdAt: "2026-01-01T00:00:00.000Z",
            },
          ],
        })
      )
    );
    renderWithProviders(<PublicKit />, { initialEntries: ["/k/bin-1"] });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /test bin/i })).toBeInTheDocument();
      expect(screen.getByText("BSS")).toBeInTheDocument();
    });
    expect(screen.getByText(/procedure kit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toHaveValue("Clinic Tablet");
  });

  it("shows error when public kit is not found", async () => {
    server.use(
      http.get("/api/public/bins/:id", () =>
        HttpResponse.json({ error: "Kit not found" }, { status: 404 })
      )
    );
    renderWithProviders(<PublicKit />, { initialEntries: ["/k/missing"] });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("submits kiosk PIN and navigates to staff bin view", async () => {
    const user = userEvent.setup();
    const { signIn } = await import("@/lib/auth-client");
    renderWithProviders(<PublicKit />, { initialEntries: ["/k/bin-1"] });

    await waitFor(() => screen.getByPlaceholderText(/clinic pin/i));
    await user.type(screen.getByPlaceholderText(/clinic pin/i), "88888888");
    await user.click(screen.getByRole("button", { name: /open in app/i }));

    await waitFor(() => {
      expect(signIn.email).toHaveBeenCalledWith({
        email: "tablet@strawhats.clinic",
        password: "88888888",
      });
    });
  });
});
