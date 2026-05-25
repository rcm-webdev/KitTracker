import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/renderWithProviders";
import Register from "./Register";

const mockSignUp = vi.fn();

vi.mock("@/lib/auth-client", () => ({
  signIn: { email: vi.fn() },
  signUp: { email: (...args: unknown[]) => mockSignUp(...args) },
  signOut: vi.fn(),
  useSession: () => ({ data: null, isPending: false }),
  getSession: vi.fn(),
}));

vi.mock("../lib/auth-client", () => ({
  signIn: { email: vi.fn() },
  signUp: { email: (...args: unknown[]) => mockSignUp(...args) },
  signOut: vi.fn(),
  useSession: () => ({ data: null, isPending: false }),
  getSession: vi.fn(),
}));

describe("Register", () => {
  beforeEach(() => {
    mockSignUp.mockReset();
  });

  it("shows required field errors when submitted empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it("shows server error message when registration fails", async () => {
    mockSignUp.mockResolvedValue({ error: { message: "Email already in use" }, data: null });
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    await user.type(screen.getByLabelText(/name/i), "Test User");
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Email already in use");
    });
  });

  it("submit button is disabled while request is in-flight", async () => {
    let resolve: (v: unknown) => void;
    mockSignUp.mockReturnValue(new Promise((res) => { resolve = res; }));
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    await user.type(screen.getByLabelText(/name/i), "Test User");
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /creating account/i })).toBeDisabled();
    });

    resolve!({ data: { user: {} }, error: null });
  });
});
