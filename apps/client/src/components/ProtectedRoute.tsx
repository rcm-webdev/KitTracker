import { Navigate, useLocation } from "react-router";
import { useSession } from "../lib/auth-client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { data: session, isPending } = useSession();
  const location = useLocation();

  if (isPending) {
    return null;
  }

  if (!session) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Admins only have access to /admin/* routes
  if (session.user.role === "admin" && !location.pathname.startsWith("/admin")) {
    return <Navigate to="/admin/users" replace />;
  }

  // Non-admins cannot access admin routes
  if (requireAdmin && session.user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
