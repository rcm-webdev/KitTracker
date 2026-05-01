import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/renderWithProviders";
import { Route, Routes } from "react-router";
import ProtectedRoute from "./ProtectedRoute";

const mockUseSession = vi.fn();

vi.mock("@/lib/auth-client", () => ({
  signIn: { email: vi.fn() },
  signUp: { email: vi.fn() },
  signOut: vi.fn(),
  useSession: () => mockUseSession(),
  getSession: vi.fn(),
}));

vi.mock("../lib/auth-client", () => ({
  signIn: { email: vi.fn() },
  signUp: { email: vi.fn() },
  signOut: vi.fn(),
  useSession: () => mockUseSession(),
  getSession: vi.fn(),
}));

describe("ProtectedRoute", () => {
  it("redirects to /login when there is no session", () => {
    mockUseSession.mockReturnValue({ data: null, isPending: false });
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><p>Protected content</p></ProtectedRoute>}
        />
      </Routes>,
      { initialEntries: ["/dashboard"] }
    );
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("renders children when session exists and user is not admin", () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: "user" } },
      isPending: false,
    });
    renderWithProviders(
      <Routes>
        <Route
          path="/dashboard"
          element={<ProtectedRoute><p>Protected content</p></ProtectedRoute>}
        />
      </Routes>,
      { initialEntries: ["/dashboard"] }
    );
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("redirects non-admin away from admin routes to /dashboard", () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: "user" } },
      isPending: false,
    });
    renderWithProviders(
      <Routes>
        <Route path="/dashboard" element={<p>Dashboard</p>} />
        <Route
          path="/admin/users"
          element={<ProtectedRoute requireAdmin><p>Admin page</p></ProtectedRoute>}
        />
      </Routes>,
      { initialEntries: ["/admin/users"] }
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("redirects admin away from /dashboard to /admin/users", () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: "admin" } },
      isPending: false,
    });
    renderWithProviders(
      <Routes>
        <Route path="/admin/users" element={<p>Admin users</p>} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><p>Dashboard page</p></ProtectedRoute>}
        />
      </Routes>,
      { initialEntries: ["/dashboard"] }
    );
    expect(screen.getByText("Admin users")).toBeInTheDocument();
  });

  it("renders nothing while session status is pending", () => {
    mockUseSession.mockReturnValue({ data: null, isPending: true });
    const { container } = renderWithProviders(
      <Routes>
        <Route
          path="/dashboard"
          element={<ProtectedRoute><p>Protected content</p></ProtectedRoute>}
        />
      </Routes>,
      { initialEntries: ["/dashboard"] }
    );
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });
});
