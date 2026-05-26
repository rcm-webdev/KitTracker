import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/renderWithProviders";
import Login from "./Login";

const mockSignIn = vi.fn();

vi.mock("@/lib/auth-client", () => ({
  signIn: { email: (...args: unknown[]) => mockSignIn(...args) },
  signUp: { email: vi.fn() },
  signOut: vi.fn(),
  useSession: () => ({ data: null, isPending: false }),
  getSession: vi.fn(),
}));

vi.mock("../lib/auth-client", () => ({
  signIn: { email: (...args: unknown[]) => mockSignIn(...args) },
  signUp: { email: vi.fn() },
  signOut: vi.fn(),
  useSession: () => ({ data: null, isPending: false }),
  getSession: vi.fn(),
}));

describe("Login", () => {
  beforeEach(() => {
    mockSignIn.mockReset();
  });

  it("shows required field errors when submitted empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("shows server error message when sign-in fails", async () => {
    mockSignIn.mockResolvedValue({ error: { message: "Invalid credentials" }, data: null });
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    await user.type(screen.getByRole("textbox", { name: "Email" }), "test@example.com");
    await user.type(screen.getByLabelText("Password", { selector: "input" }), "wrongpass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials");
    });
  });

  it("submit button is disabled while request is in-flight", async () => {
    let resolve: (v: unknown) => void;
    mockSignIn.mockReturnValue(new Promise((res) => { resolve = res; }));
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    await user.type(screen.getByRole("textbox", { name: "Email" }), "test@example.com");
    await user.type(screen.getByLabelText("Password", { selector: "input" }), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
    });

    resolve!({ data: { user: { role: "user" } }, error: null });
  });
});
