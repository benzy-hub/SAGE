"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-foreground/10">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
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
            <Button
              variant="outline"
              className="border-2 border-foreground hover:bg-foreground hover:text-background transition-all duration-200"
              asChild
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Error Code */}
          <div className="relative mb-8">
            <div className="text-[8rem] sm:text-[12rem] lg:text-[16rem] font-bold text-foreground/5 leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-primary/10 rounded-full p-6 sm:p-8">
                <Search
                  className="w-12 h-12 sm:w-16 sm:h-16 text-primary"
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4 mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Page Not Found
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Oops! The page you&apos;re looking for seems to have wandered off.
              It might have been moved, deleted, or perhaps never existed.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-xl px-6 sm:px-8 h-12 sm:h-14 bg-foreground text-background hover:bg-foreground/90 font-medium transition-all duration-200 hover:scale-[1.02]"
              asChild
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto rounded-xl px-6 sm:px-8 h-12 sm:h-14 border-2 border-foreground hover:bg-foreground hover:text-background font-medium transition-all duration-200"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-foreground/10 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} SAGE. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
