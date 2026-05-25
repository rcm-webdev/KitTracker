import { useState } from "react";
import type { AdminUser } from "@strawhats/shared";

interface DeleteUserModalProps {
  user: AdminUser;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function DeleteUserModal({ user, onConfirm, onCancel }: DeleteUserModalProps) {
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmEmail === user.email;

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setIsDeleting(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 24,
          maxWidth: 440,
          width: "100%",
          margin: "0 16px",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <h2 id="delete-modal-title" style={{ marginTop: 0 }}>
          Delete {user.name}?
        </h2>
        <p>
          <strong>{user.email}</strong> has{" "}
          <strong>{user.binCount} {user.binCount === 1 ? "bin" : "bins"}</strong> and{" "}
          <strong>{user.itemCount} {user.itemCount === 1 ? "item" : "items"}</strong>.
          Deleting this account is <strong>permanent and cannot be undone</strong>.
        </p>
        <label htmlFor="confirm-email" style={{ display: "block", marginBottom: 4 }}>
          Type <strong>{user.email}</strong> to confirm:
        </label>
        <input
          id="confirm-email"
          type="email"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          style={{ width: "100%", padding: "6px 8px", marginBottom: 16, boxSizing: "border-box" }}
          autoFocus
        />
        {error && (
          <p role="alert" style={{ color: "red", marginBottom: 12 }}>
            {error}
          </p>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} disabled={isDeleting}>
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete || isDeleting}
            style={{
              background: canDelete ? "#dc2626" : "#e5e7eb",
              color: canDelete ? "#fff" : "#9ca3af",
              border: "none",
              borderRadius: 4,
              padding: "6px 16px",
              cursor: canDelete ? "pointer" : "not-allowed",
            }}
          >
            {isDeleting ? "Deleting…" : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
