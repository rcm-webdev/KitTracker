import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@testing-library/react";
import DeleteUserModal from "./DeleteUserModal";
import type { AdminUser } from "@strawhats/shared";

const user: AdminUser = {
  id: "user-2",
  email: "target@example.com",
  name: "Target User",
  role: "user",
  banned: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  binCount: 3,
  itemCount: 10,
};

describe("DeleteUserModal", () => {
  it("confirm button is disabled when email field is empty", () => {
    render(
      <DeleteUserModal user={user} onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByRole("button", { name: /delete account/i })).toBeDisabled();
  });

  it("confirm button is disabled when email doesn't match", async () => {
    const ue = userEvent.setup();
    render(
      <DeleteUserModal user={user} onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    await ue.type(screen.getByLabelText(/type.*to confirm/i), "wrong@example.com");
    expect(screen.getByRole("button", { name: /delete account/i })).toBeDisabled();
  });

  it("confirm button is enabled when email matches exactly", async () => {
    const ue = userEvent.setup();
    render(
      <DeleteUserModal user={user} onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    await ue.type(screen.getByLabelText(/type.*to confirm/i), user.email);
    expect(screen.getByRole("button", { name: /delete account/i })).toBeEnabled();
  });

  it("calls onConfirm when confirmed with matching email", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const ue = userEvent.setup();
    render(
      <DeleteUserModal user={user} onConfirm={onConfirm} onCancel={vi.fn()} />
    );
    await ue.type(screen.getByLabelText(/type.*to confirm/i), user.email);
    await ue.click(screen.getByRole("button", { name: /delete account/i }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce());
  });

  it("calls onCancel when cancel is clicked", async () => {
    const onCancel = vi.fn();
    const ue = userEvent.setup();
    render(
      <DeleteUserModal user={user} onConfirm={vi.fn()} onCancel={onCancel} />
    );
    await ue.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("shows error message when onConfirm throws", async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error("Delete failed"));
    const ue = userEvent.setup();
    render(
      <DeleteUserModal user={user} onConfirm={onConfirm} onCancel={vi.fn()} />
    );
    await ue.type(screen.getByLabelText(/type.*to confirm/i), user.email);
    await ue.click(screen.getByRole("button", { name: /delete account/i }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Delete failed");
    });
  });
});
