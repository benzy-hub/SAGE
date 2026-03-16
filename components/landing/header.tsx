"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";

const navigation = [
  { name: "Services", href: "#services" },
  { name: "How it Works", href: "#how-it-works" },
  { name: "User Roles", href: "#roles" },
  { name: "Use Cases", href: "#use-cases" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Contact", href: "#contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        if (!active) return;
        setIsAuthenticated(Boolean(data?.authenticated));
      } catch {
        if (!active) return;
        setIsAuthenticated(false);
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-2 sm:p-3">
      <div className="mx-auto max-w-7xl">
        <nav
          className={`rounded-2xl border border-transparent px-3 sm:px-4 transition-all duration-300 ${
            scrolled || mobileMenuOpen
              ? "border-border/50 bg-background/80 shadow-lg shadow-black/5 backdrop-blur-2xl"
              : "bg-transparent"
          }`}
        >
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                <Image
                  src="/logo.svg"
                  alt="SAGE Logo"
                  fill
                  className="object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </div>
              <span className="text-lg sm:text-xl font-bold text-foreground">
                SAGE
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              {isAuthenticated ? (
                <Button
                  className="bg-foreground text-background hover:bg-primary transition-all duration-200"
                  asChild
                  size="lg"
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="border-2 border-foreground hover:bg-foreground hover:text-background transition-all duration-200"
                    asChild
                    size="lg"
                  >
                    <Link href="/auth/login">Login</Link>
                  </Button>
                  <Button
                    className="bg-foreground text-background hover:bg-primary transition-all duration-200"
                    asChild
                    size="lg"
                  >
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile CTA + Sidebar Toggle */}
            <div className="lg:hidden flex items-center gap-2">
              <Button
                size="sm"
                className="h-9 px-3 bg-foreground text-background hover:bg-primary"
                asChild
              >
                <Link href={isAuthenticated ? "/dashboard" : "/auth/signup"}>
                  {isAuthenticated ? "Dashboard" : "Get Started"}
                </Link>
              </Button>

              <button
                type="button"
                aria-label="Toggle sidebar menu"
                className="p-2 rounded-lg border-2 border-foreground/20 hover:border-foreground hover:bg-foreground/5 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <PanelLeftClose className="w-5 h-5 text-foreground" />
                ) : (
                  <PanelLeftOpen className="w-5 h-5 text-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4">
              <div className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="flex flex-col gap-3 pt-4 border-t border-foreground/10">
                  {isAuthenticated ? (
                    <Button
                      size="lg"
                      className="w-full bg-foreground text-background hover:bg-primary"
                      asChild
                    >
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full border-2 border-foreground hover:bg-foreground hover:text-background"
                        asChild
                      >
                        <Link href="/auth/login">Login</Link>
                      </Button>
                      <Button
                        size="lg"
                        className="w-full bg-foreground text-background hover:bg-primary"
                        asChild
                      >
                        <Link href="/auth/signup">Get Started</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
