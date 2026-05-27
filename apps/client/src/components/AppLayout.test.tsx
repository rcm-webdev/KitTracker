import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, within } from "@testing-library/react";
import { Route, Routes } from "react-router";
import { renderWithProviders } from "@/test/renderWithProviders";
import AppLayout from "./AppLayout";

const mockUseSession = vi.fn();
const mockUseMe = vi.fn();

vi.mock("@/hooks/useMe", () => ({
  useMe: () => mockUseMe(),
}));

vi.mock("@/lib/auth-client", () => ({
  signOut: vi.fn(),
  useSession: () => mockUseSession(),
}));

vi.mock("../lib/auth-client", () => ({
  signOut: vi.fn(),
  useSession: () => mockUseSession(),
}));

const technicianMe = {
  data: {
    role: "technician" as const,
    assignedProviders: [] as string[],
    permissions: {
      canCreateKits: false,
      canEditKits: false,
      canViewDashboard: true,
      canSearch: true,
      scanOnly: false,
      isKiosk: false,
    },
  },
  isPending: false,
};

describe("AppLayout", () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: { user: { name: "Beto", role: "technician" } },
      isPending: false,
    });
    mockUseMe.mockReturnValue(technicianMe);
  });

  it("renders mobile bottom tabs with short labels", () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <p>Page content</p>
            </AppLayout>
          }
        />
      </Routes>,
      { initialEntries: ["/dashboard"] },
    );

    const mobileNav = screen.getByRole("navigation", { name: "Main navigation" });
    expect(within(mobileNav).getByRole("link", { name: "Kits" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(within(mobileNav).getByRole("link", { name: "Search" })).toHaveAttribute(
      "href",
      "/search",
    );
    expect(within(mobileNav).getByRole("link", { name: "Scan" })).toHaveAttribute(
      "href",
      "/scan",
    );
  });

  it("hides desktop sidebar nav from the document on mobile (md breakpoint CSS)", () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <p>Page content</p>
            </AppLayout>
          }
        />
      </Routes>,
      { initialEntries: ["/dashboard"] },
    );

    const aside = document.querySelector("aside");
    expect(aside).toHaveClass("hidden");
    expect(aside).toHaveClass("md:flex");
  });

  it("shows only Scan in bottom tabs for scan-only kiosk users", () => {
    mockUseMe.mockReturnValue({
      data: {
        role: "technician" as const,
        assignedProviders: [] as string[],
        permissions: {
          canCreateKits: false,
          canEditKits: false,
          canViewDashboard: false,
          canSearch: false,
          scanOnly: true,
          isKiosk: true,
        },
      },
      isPending: false,
    });

    renderWithProviders(
      <Routes>
        <Route
          path="/scan"
          element={
            <AppLayout>
              <p>Scanner</p>
            </AppLayout>
          }
        />
      </Routes>,
      { initialEntries: ["/scan"] },
    );

    const mobileNav = screen.getByRole("navigation", { name: "Main navigation" });
    expect(within(mobileNav).getAllByRole("link")).toHaveLength(1);
    expect(within(mobileNav).getByRole("link", { name: "Scan" })).toBeInTheDocument();
  });
});
