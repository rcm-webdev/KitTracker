import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ScanLine,
  Search,
  Users,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { useMe } from "@/hooks/useMe";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSED_KEY = "strawhats-sidebar-collapsed";

const navItems = [
  { to: "/dashboard", label: "Procedure kits", icon: LayoutDashboard },
  { to: "/search", label: "Search", icon: Search },
  { to: "/scan", label: "Scan QR", icon: ScanLine },
] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { data: session } = useSession();
  const { data: me } = useMe();
  const user = session?.user;
  const isAdmin = user?.role === "admin";
  const permissions = me?.permissions;

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  async function handleSignOut() {
    await signOut();
    window.location.href = "/login";
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={cn(
          "flex h-full min-h-0 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
          collapsed ? "w-14" : "w-56",
        )}
      >
        <div
          className={cn(
            "flex items-center border-b border-sidebar-border",
            collapsed
              ? "justify-center px-2 py-4"
              : "justify-between gap-2 px-4 py-4",
          )}
        >
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wide">KitTracker</p>
              <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                In-clinic procedure kits
              </p>
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {navItems.map(({ to, label, icon: Icon }) => {
            if (permissions?.scanOnly && to !== "/scan") return null;
            if (to === "/dashboard" && permissions && !permissions.canViewDashboard) {
              return null;
            }
            if (to === "/search" && permissions && !permissions.canSearch) {
              return null;
            }
            const active =
              to === "/dashboard"
                ? location.pathname === "/dashboard"
                : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center rounded-none py-2 text-xs transition-colors",
                  collapsed ? "justify-center px-2" : "gap-2 px-2.5",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin/users"
              title={collapsed ? "Users" : undefined}
              className={cn(
                "flex items-center rounded-none py-2 text-xs transition-colors",
                collapsed ? "justify-center px-2" : "gap-2 px-2.5",
                location.pathname.startsWith("/admin")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60",
              )}
            >
              <Users className="size-4 shrink-0" />
              {!collapsed && <span>Users</span>}
            </Link>
          )}
        </nav>

        <div
          className={cn(
            "border-t border-sidebar-border",
            collapsed ? "flex flex-col items-center gap-2 p-2" : "p-3",
          )}
        >
          {!collapsed && (
            <>
              <p className="truncate text-xs font-medium">
                {user?.name ?? user?.email}
              </p>
              <p className="text-[10px] capitalize text-muted-foreground">
                {me?.role ?? user?.role ?? "technician"}
              </p>
              {me && me.assignedProviders.length > 0 && (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Team: {me.assignedProviders.join(", ")}
                </p>
              )}
            </>
          )}
          <Button
            type="button"
            variant="ghost"
            size={collapsed ? "icon-sm" : "sm"}
            className={cn(!collapsed && "mt-2 w-full justify-start gap-2 px-0")}
            onClick={handleSignOut}
            title="Sign out"
          >
            <LogOut className="size-4" />
            {!collapsed && "Sign out"}
          </Button>
        </div>
      </aside>

      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-6">
        {children}
      </main>
    </div>
  );
}
