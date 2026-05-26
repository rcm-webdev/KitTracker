import { Navigate, useLocation } from "react-router";
import { useSession } from "../lib/auth-client";
import { useMe } from "../hooks/useMe";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

function isKioskAllowedPath(pathname: string): boolean {
  if (pathname.startsWith("/scan")) return true;
  if (pathname.startsWith("/k/")) return true;
  if (/^\/bins\/[^/]+$/.test(pathname)) return true;
  return false;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { data: session, isPending: sessionPending } = useSession();
  const { data: me, isPending: mePending } = useMe();
  const location = useLocation();

  if (sessionPending || (session && mePending)) {
    return null;
  }

  if (!session) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (me?.permissions.scanOnly && !isKioskAllowedPath(location.pathname)) {
    return <Navigate to="/scan" replace />;
  }

  if (session.user.role === "admin" && !location.pathname.startsWith("/admin")) {
    return <Navigate to="/admin/users" replace />;
  }

  if (requireAdmin && session.user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
