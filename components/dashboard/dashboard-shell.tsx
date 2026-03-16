"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type {
  DashboardIconKey,
  DashboardNavItem,
} from "@/components/dashboard/dashboard-navigation";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChartColumn,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";

interface DashboardShellProps {
  role: "ADVISOR" | "STUDENT";
  title: string;
  description: string;
  subtitle: string;
  navItems: DashboardNavItem[];
  mobileNavItems: DashboardNavItem[];
  currentUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "ADVISOR" | "STUDENT";
    about: string;
  };
  children: React.ReactNode;
}

const roleMeta = {
  ADVISOR: {
    badge: "Advisor Workspace",
    icon: UserRound,
    roleHome: "/dashboard/advisor",
    accentLabel: "Guide student success with clarity and speed.",
  },
  STUDENT: {
    badge: "Student Workspace",
    icon: GraduationCap,
    roleHome: "/dashboard/student",
    accentLabel: "Stay on top of goals, progress, and guidance.",
  },
};

const navIcons: Record<
  DashboardIconKey,
  React.ComponentType<{ className?: string }>
> = {
  home: Home,
  users: Users,
  calendar: CalendarDays,
  book: BookOpen,
  chart: ChartColumn,
  messages: MessageSquare,
  settings: Settings,
  sparkles: Sparkles,
};

export function DashboardShell({
  role,
  title,
  description,
  subtitle,
  navItems,
  mobileNavItems,
  currentUser,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const meta = roleMeta[role];
  const Icon = meta.icon;
  const messagesHref = `${meta.roleHome}/messages`;

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Signed out successfully");
      router.replace("/auth/login");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setLoading(false);
    }
  };

  // Lock body scroll when mobile nav drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add("nav-open");
    } else {
      document.body.classList.remove("nav-open");
    }
    return () => document.body.classList.remove("nav-open");
  }, [mobileMenuOpen]);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const response = await fetch("/api/messages/unread-count", {
          cache: "no-store",
        });
        const data = await response.json();
        setUnreadCount(Number(data?.unreadCount ?? 0));
      } catch {
        setUnreadCount(0);
      }
    };

    void loadUnreadCount();

    return () => {
      // no-op cleanup for initial fetch effect
    };
  }, []);

  useEffect(() => {
    if (!currentUser.id) return;

    const initSocket = async () => {
      await fetch("/api/socket");

      const socket = io({
        path: "/api/socket_io",
        transports: ["websocket", "polling"],
      });

      socket.emit("join", { userId: currentUser.id });

      socket.on(
        "message:new",
        (incoming: { recipientId?: string; senderId?: string }) => {
          if (!incoming) return;
          if (incoming.recipientId === currentUser.id) {
            setUnreadCount((prev) => prev + 1);
          }
        },
      );

      socket.on("message:read", () => {
        void fetch("/api/messages/unread-count", { cache: "no-store" })
          .then((res) => res.json())
          .then((data) => setUnreadCount(Number(data?.unreadCount ?? 0)))
          .catch(() => {});
      });

      socket.on("connection:updated", () => {
        void fetch("/api/messages/unread-count", { cache: "no-store" })
          .then((res) => res.json())
          .then((data) => setUnreadCount(Number(data?.unreadCount ?? 0)))
          .catch(() => {});
      });

      socketRef.current = socket;
    };

    void initSocket();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [currentUser.id]);

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
              aria-label="Open dashboard navigation"
              className="lg:hidden p-2 rounded-xl border-2 border-foreground/20 hover:border-foreground hover:bg-foreground/5 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>

            <Link
              href={meta.roleHome}
              data-tour="top-brand"
              className="flex items-center gap-2 group min-w-0"
            >
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0">
                <Image
                  src="/logo.svg"
                  alt="SAGE Logo"
                  fill
                  className="object-contain transition-transform duration-200 group-hover:scale-105"
                  priority
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  SAGE
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {meta.badge}
                </p>
              </div>
            </Link>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <Button
              variant="outline"
              className="border-2 border-foreground rounded-xl"
              asChild
            >
              <Link
                href={messagesHref}
                data-tour="nav-messages"
                className="relative"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
                {unreadCount > 0 ? (
                  <span className="absolute -top-2 -right-2 inline-flex min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-2 border-foreground rounded-xl"
              asChild
            >
              <Link href="/dashboard">All Dashboards</Link>
            </Button>
            <Button
              onClick={handleLogout}
              disabled={loading}
              className="bg-foreground text-background hover:bg-primary rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {loading ? "Signing out..." : "Logout"}
            </Button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 animate-in fade-in duration-150">
          <button
            type="button"
            aria-label="Close dashboard navigation"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside
            className="relative h-full w-[88%] max-w-sm bg-secondary border-r-2 border-foreground p-4 overflow-y-auto scrollbar-none native-scroll animate-in slide-in-from-left-3 duration-200"
            style={{ paddingTop: "max(env(safe-area-inset-top), 1rem)" }}
          >
            <div className="flex items-center justify-between gap-3 mb-5">
              <Link
                href={meta.roleHome}
                className="flex items-center gap-2 min-w-0"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="relative w-9 h-9 shrink-0">
                  <Image
                    src="/logo.svg"
                    alt="SAGE Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">SAGE</p>
                  <p className="text-xs text-muted-foreground">{meta.badge}</p>
                </div>
              </Link>

              <button
                type="button"
                aria-label="Close dashboard navigation"
                className="p-2 rounded-lg border-2 border-foreground/20 hover:border-foreground hover:bg-background transition-colors"
                onClick={() => setMobileMenuOpen(false)}
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
                {meta.accentLabel}
              </p>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const NavIcon = navIcons[item.icon];
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-2xl border-2 transition-all ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-transparent bg-background hover:border-foreground/20 hover:bg-white"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <NavIcon className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <Button
              onClick={handleLogout}
              disabled={loading}
              className="mt-5 w-full bg-foreground text-background hover:bg-primary rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {loading ? "Signing out..." : "Logout"}
            </Button>
          </aside>
        </div>
      )}

      <div className="w-full max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid lg:grid-cols-[300px_minmax(0,1fr)] gap-5 lg:gap-8 min-h-[calc(100vh-8rem)]">
          <aside className="hidden lg:flex flex-col bg-secondary border-2 border-foreground rounded-[2rem] p-5 h-[calc(100vh-8.5rem)] sticky top-24 overflow-y-auto scrollbar-none">
            <div className="bg-background border-2 border-foreground rounded-[1.6rem] p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-foreground text-background flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {currentUser.firstName} {currentUser.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentUser.email}
                  </p>
                </div>
              </div>
              <p className="text-xs font-medium text-primary mt-4">
                {meta.accentLabel}
              </p>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const NavIcon = navIcons[item.icon];
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-tour={`nav-${item.icon}`}
                    className={`flex items-center justify-between gap-3 px-3 py-3 rounded-2xl border-2 transition-all ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-transparent bg-background hover:border-foreground/20 hover:bg-white"
                    }`}
                  >
                    <span className="inline-flex items-center gap-3 min-w-0">
                      <NavIcon className="w-4 h-4 shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {item.label}
                      </span>
                    </span>
                    {item.icon === "messages" && unreadCount > 0 ? (
                      <span className="inline-flex min-w-5 h-5 px-1 rounded-full bg-destructive text-white text-[10px] items-center justify-center font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    ) : (
                      <ArrowRight className="w-4 h-4 shrink-0 opacity-70" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <Button
              onClick={handleLogout}
              disabled={loading}
              className="mt-auto w-full bg-foreground text-background hover:bg-primary rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {loading ? "Signing out..." : "Logout"}
            </Button>
          </aside>

          <main className="min-w-0 space-y-6">
            <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
              <div className="flex flex-col xl:flex-row xl:items-start gap-4 sm:gap-6">
                <div className="sage-section-chip self-start">
                  <span className="text-xl sm:text-2xl font-medium text-primary-foreground inline-flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {meta.badge}
                  </span>
                </div>
                <div className="min-w-0">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                    {title}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-3xl leading-relaxed">
                    {description}
                  </p>
                  <p className="text-sm font-medium text-primary mt-3">
                    {subtitle}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid sm:grid-cols-2 gap-4">
                <div className="rounded-[1.4rem] border-2 border-foreground/15 bg-background p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Professional focus
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Clean navigation, role-aware modules, and mobile-first
                    actions keep your daily workflow fast and reliable.
                  </p>
                </div>
                <div className="rounded-[1.4rem] border-2 border-foreground/15 bg-background p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Design language
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    This shell follows the landing page visual system for a
                    consistent, premium experience across all dashboards.
                  </p>
                </div>
              </div>
            </section>

            {children}
          </main>
        </div>
      </div>

      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/98 backdrop-blur-xl border-t border-foreground/10 no-select"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-4 px-1 py-1">
          {mobileNavItems.map((item) => {
            const NavIcon = navIcons[item.icon];
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-tour={`nav-${item.icon}`}
                className="relative flex flex-col items-center justify-center gap-0.5 py-2 px-1 min-h-14"
              >
                <div
                  className={`relative flex flex-col items-center justify-center gap-0.5 px-3.5 py-1.5 rounded-2xl transition-all ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <NavIcon className="w-5 h-5" />
                  <span className="text-[10px] font-medium leading-none">
                    {item.shortLabel}
                  </span>
                  {item.icon === "messages" && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex min-w-4 h-4 px-1 rounded-full bg-destructive text-white text-[9px] items-center justify-center font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
