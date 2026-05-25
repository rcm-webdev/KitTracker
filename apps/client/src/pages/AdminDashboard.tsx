import { useState } from "react";
import { signOut, useSession } from "../lib/auth-client";
import DeleteUserModal from "../components/DeleteUserModal";
import { Skeleton } from "../components/ui/skeleton";
import {
  useAdminUsers,
  useBanUser,
  useDeleteUser,
} from "../hooks/useAdminUsers";
import type { AdminUser } from "@strawhats/shared";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);

  const { data: users = [], isPending, isError, error } = useAdminUsers();
  const banUser = useBanUser();
  const deleteUser = useDeleteUser();

  async function handleSignOut() {
    await signOut();
    window.location.href = "/login";
  }

  function handleToggleBan(user: AdminUser) {
    banUser.mutate({ id: user.id, banned: user.banned });
  }

  function handleDelete(user: AdminUser): Promise<void> {
    return new Promise((resolve, reject) => {
      deleteUser.mutate(user.id, {
        onSuccess: () => { setPendingDelete(null); resolve(); },
        onError: (err) => reject(err),
      });
    });
  }

  const isSelf = (user: AdminUser) => user.id === session?.user?.id;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>User Management</h1>
        <button onClick={handleSignOut}>Sign Out</button>
      </header>

      {isError && (
        <p role="alert" style={{ color: "red" }}>
          {error.message}
        </p>
      )}
      {banUser.isError && (
        <p role="alert" style={{ color: "red" }}>
          {banUser.error.message}
        </p>
      )}
      {deleteUser.isError && (
        <p role="alert" style={{ color: "red" }}>
          {deleteUser.error.message}
        </p>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Email", "Name", "Role", "Status", "Joined", "Actions"].map(
              (h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "8px",
                    borderBottom: "2px solid #ccc",
                  }}
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {isPending
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {[200, 120, 60, 60, 80, 120].map((w, j) => (
                    <td
                      key={j}
                      style={{ padding: "8px", borderBottom: "1px solid #eee" }}
                    >
                      <Skeleton style={{ height: 16, width: w }} />
                    </td>
                  ))}
                </tr>
              ))
            : users.map((user) => (
                <tr key={user.id} style={{ opacity: isSelf(user) ? 0.6 : 1 }}>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #eee" }}
                  >
                    {user.email}
                  </td>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #eee" }}
                  >
                    {user.name}
                  </td>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #eee" }}
                  >
                    {user.role ?? "user"}
                  </td>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #eee" }}
                  >
                    {user.banned ? "Deactivated" : "Active"}
                  </td>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #eee" }}
                  >
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #eee" }}
                  >
                    <button
                      onClick={() => handleToggleBan(user)}
                      disabled={isSelf(user)}
                      style={{ marginRight: 8 }}
                    >
                      {user.banned ? "Reactivate" : "Deactivate"}
                    </button>
                    <button
                      onClick={() => setPendingDelete(user)}
                      disabled={isSelf(user)}
                      style={{ color: "#dc2626" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>

      {pendingDelete && (
        <DeleteUserModal
          user={pendingDelete}
          onConfirm={() => handleDelete(pendingDelete)}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
