"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  GraduationCap,
  School,
  CalendarCheck,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  PanelLeftOpen,
  PanelLeftClose,
  Building2,
  Bell,
  Plug,
  LifeBuoy,
  X,
} from "lucide-react";

interface AdminSidebarShellProps {
  currentUser: {
    firstName: string;
    lastName: string;
    email: string;
    role: "ADMIN";
  };
  children: React.ReactNode;
}

const navItems = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/colleges", label: "Colleges", icon: School },
  {
    href: "/dashboard/admin/students",
    label: "Students",
    icon: GraduationCap,
  },
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  {
    href: "/dashboard/admin/departments",
    label: "Departments",
    icon: Building2,
  },
  { href: "/dashboard/admin/advisors", label: "Advisors", icon: UserCheck },
  {
    href: "/dashboard/admin/appointments",
    label: "Appointments",
    icon: CalendarCheck,
  },
  {
    href: "/dashboard/admin/notifications",
    label: "Notifications",
    icon: Bell,
  },
  { href: "/dashboard/admin/reports", label: "Reports", icon: BarChart3 },
  {
    href: "/dashboard/admin/integrations",
    label: "Integrations",
    icon: Plug,
  },
  { href: "/dashboard/admin/audit-log", label: "Audit Log", icon: Shield },
  {
    href: "/dashboard/admin/support",
    label: "Support",
    icon: LifeBuoy,
  },
  { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
];

const mobileBottomNav = [
  {
    href: "/dashboard/admin",
    label: "Overview",
    shortLabel: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/admin/students",
    label: "Students",
    shortLabel: "Students",
    icon: GraduationCap,
  },
  {
    href: "/dashboard/admin/reports",
    label: "Reports",
    shortLabel: "Reports",
    icon: BarChart3,
  },
  {
    href: "/dashboard/admin/settings",
    label: "Settings",
    shortLabel: "Settings",
    icon: Settings,
  },
];

export function AdminSidebarShell({
  currentUser,
  children,
}: AdminSidebarShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openMobileSidebar, setOpenMobileSidebar] = useState(false);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (openMobileSidebar) {
      document.body.classList.add("nav-open");
    } else {
      document.body.classList.remove("nav-open");
    }
    return () => document.body.classList.remove("nav-open");
  }, [openMobileSidebar]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Signed out successfully");
      router.replace("/auth/login");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      className="min-h-dvh bg-background"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 5rem)" }}
    >
      <header className="sticky top-0 z-40 p-2 sm:p-3">
        <div className="w-full max-w-9xl mx-auto rounded-2xl border border-border/50 bg-background/80 shadow-lg shadow-black/5 backdrop-blur-2xl px-4 sm:px-6 lg:px-8 h-14 sm:h-16 lg:h-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Toggle admin sidebar"
              className="lg:hidden p-2 rounded-lg border-2 border-foreground/20 hover:border-foreground hover:bg-foreground/5 transition-colors"
              onClick={() => setOpenMobileSidebar((prev) => !prev)}
            >
              {openMobileSidebar ? (
                <PanelLeftClose className="w-5 h-5" />
              ) : (
                <PanelLeftOpen className="w-5 h-5" />
              )}
            </button>

            <Link
              href="/dashboard/admin"
              className="flex items-center gap-2"
              data-tour="top-brand"
            >
              <span className="inline-flex w-9 h-9 rounded-lg bg-foreground text-background items-center justify-center font-bold">
                S
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  SAGE Admin
                </p>
                <p className="text-xs text-muted-foreground">
                  System Control Center
                </p>
              </div>
            </Link>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <Button
              variant="outline"
              className="border-2 border-foreground"
              asChild
            >
              <Link href="/dashboard">Role Dashboard</Link>
            </Button>
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-foreground text-background hover:bg-primary"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? "Signing out..." : "Logout"}
            </Button>
          </div>
        </div>
      </header>

      {openMobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50 animate-in fade-in duration-150">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setOpenMobileSidebar(false)}
          />
          <aside
            className="relative h-full w-[86%] max-w-sm bg-secondary border-r-2 border-foreground p-4 overflow-y-auto scrollbar-none native-scroll animate-in slide-in-from-left-3 duration-200"
            style={{ paddingTop: "max(env(safe-area-inset-top), 1rem)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-foreground">
                Admin Navigation
              </p>
              <button
                type="button"
                aria-label="Close sidebar"
                className="p-2 rounded-lg border-2 border-foreground/20 hover:border-foreground hover:bg-background"
                onClick={() => setOpenMobileSidebar(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-background border-2 border-foreground rounded-2xl p-4 mb-4">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-base font-semibold text-foreground mt-1">
                {currentUser.firstName} {currentUser.lastName}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {currentUser.email}
              </p>
              <p className="text-xs font-medium text-primary mt-2">
                Role: {currentUser.role}
              </p>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                const tourKey = item.href.split("/").pop() || "overview";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-tour={`admin-nav-${tourKey}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all ${
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-transparent hover:border-foreground/20 hover:bg-background"
                    }`}
                    onClick={() => setOpenMobileSidebar(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-4 w-full bg-foreground text-background hover:bg-primary"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? "Signing out..." : "Logout"}
            </Button>
          </aside>
        </div>
      )}

      <div className="w-full max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-5 lg:gap-8 min-h-[calc(100vh-8rem)]">
          <aside className="hidden lg:flex flex-col bg-secondary border-2 border-foreground rounded-[1.6rem] p-5 h-[calc(100vh-8.5rem)] sticky top-24 overflow-y-auto scrollbar-none">
            <div className="bg-background border-2 border-foreground rounded-2xl p-4 mb-4">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-base font-semibold text-foreground mt-1">
                {currentUser.firstName} {currentUser.lastName}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {currentUser.email}
              </p>
              <p className="text-xs font-medium text-primary mt-2">
                Role: {currentUser.role}
              </p>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                const tourKey = item.href.split("/").pop() || "overview";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-tour={`admin-nav-${tourKey}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all ${
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-transparent hover:border-foreground/20 hover:bg-background"
                    }`}
                    onClick={() => setOpenMobileSidebar(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-auto w-full bg-foreground text-background hover:bg-primary"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? "Signing out..." : "Logout"}
            </Button>
          </aside>

          <main className="space-y-6 min-w-0">{children}</main>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/98 backdrop-blur-xl border-t border-foreground/10 no-select"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-4 px-1 py-1">
          {mobileBottomNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center gap-0.5 py-2 px-1 min-h-14"
              >
                <div
                  className={`flex flex-col items-center justify-center gap-0.5 px-3.5 py-1.5 rounded-2xl transition-all ${
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium leading-none">
                    {item.shortLabel}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
