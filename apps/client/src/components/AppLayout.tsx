import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ScanLine,
  Search,
  Users,
  type LucideIcon,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { useMe } from "@/hooks/useMe";
import type { UserPermissions } from "@kittracker/shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSED_KEY = "kittracker-sidebar-collapsed";

const navItems = [
  { to: "/dashboard", label: "Procedure kits", mobileLabel: "Kits", icon: LayoutDashboard },
  { to: "/search", label: "Search", mobileLabel: "Search", icon: Search },
  { to: "/scan", label: "Scan QR", mobileLabel: "Scan", icon: ScanLine },
] as const;

const adminNavItem = {
  to: "/admin/users",
  label: "Users",
  mobileLabel: "Users",
  icon: Users,
} as const;

type NavEntry = {
  to: string;
  label: string;
  mobileLabel: string;
  icon: LucideIcon;
};

function isNavActive(pathname: string, to: string) {
  if (to === "/dashboard") return pathname === "/dashboard";
  if (to === "/admin/users") return pathname.startsWith("/admin");
  return pathname.startsWith(to);
}

function visibleNavItems(
  permissions: UserPermissions | undefined,
  isAdmin: boolean,
): NavEntry[] {
  const items: NavEntry[] = navItems.filter((item) => {
    if (permissions?.scanOnly && item.to !== "/scan") return false;
    if (item.to === "/dashboard" && permissions && !permissions.canViewDashboard) {
      return false;
    }
    if (item.to === "/search" && permissions && !permissions.canSearch) {
      return false;
    }
    return true;
  });
  if (isAdmin) items.push(adminNavItem);
  return items;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { data: session } = useSession();
  const { data: me } = useMe();
  const user = session?.user;
  const isAdmin = user?.role === "admin";
  const permissions = me?.permissions;

  const items = useMemo(
    () => visibleNavItems(permissions, isAdmin),
    [permissions, isAdmin],
  );

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

  const displayName = user?.name ?? user?.email ?? "Account";

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={cn(
          "hidden h-full min-h-0 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
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

        <nav className="flex flex-1 flex-col gap-0.5 p-2" aria-label="Sidebar navigation">
          {items.map(({ to, label, icon: Icon }) => {
            const active = isNavActive(location.pathname, to);
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
              {me && (me.assignedProviders?.length ?? 0) > 0 && (
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4 py-3 md:hidden">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide">KitTracker</p>
            <p className="truncate text-[10px] text-muted-foreground">{displayName}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleSignOut}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="size-4" />
          </Button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          {children}
        </main>

        {items.length > 0 && (
          <nav
            aria-label="Main navigation"
            className="flex shrink-0 border-t border-sidebar-border bg-sidebar pb-[env(safe-area-inset-bottom)] md:hidden"
          >
            {items.map(({ to, mobileLabel, icon: Icon }) => {
              const active = isNavActive(location.pathname, to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors",
                    active
                      ? "text-sidebar-primary"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon
                    className={cn("size-5 shrink-0", active && "text-sidebar-primary")}
                    aria-hidden
                  />
                  <span className="truncate">{mobileLabel}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
