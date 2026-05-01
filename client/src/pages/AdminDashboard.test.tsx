import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/msw/server";
import { mockAdminUser } from "@/test/msw/handlers";
import AdminDashboard from "./AdminDashboard";

vi.mock("../lib/auth-client", () => ({
  signIn: { email: vi.fn() },
  signUp: { email: vi.fn() },
  signOut: vi.fn(),
  useSession: () => ({
    data: { user: { id: "admin-1", role: "admin" } },
    isPending: false,
  }),
  getSession: vi.fn(),
}));

describe("AdminDashboard", () => {
  it("shows skeleton rows while users are loading", () => {
    server.use(
      http.get("/api/admin/users", async () => {
        await new Promise((r) => setTimeout(r, 200));
        return HttpResponse.json([mockAdminUser]);
      })
    );
    renderWithProviders(<AdminDashboard />);
    // 5 skeleton rows × 6 cells — table body rows should be present
    expect(screen.getAllByRole("row").length).toBeGreaterThan(1);
  });

  it("shows error message when admin users fetch fails", async () => {
    server.use(
      http.get("/api/admin/users", () =>
        HttpResponse.json({ error: "Forbidden" }, { status: 403 })
      )
    );
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("renders each user's email in the table", async () => {
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText(mockAdminUser.email)).toBeInTheDocument();
    });
  });

  it("opens DeleteUserModal when delete button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => screen.getByText(mockAdminUser.email));
    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes modal when cancel is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => screen.getByText(mockAdminUser.email));
    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
