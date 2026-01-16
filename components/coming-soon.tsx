"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Bell, Clock, Sparkles } from "lucide-react";

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export function ComingSoon({
  title = "Coming Soon",
  description = "We're working hard to bring you something amazing. This feature is currently under development and will be available soon.",
}: ComingSoonProps) {

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
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center justify-center px-4 py-1.5 bg-primary/10 rounded-full mb-6">
            <span className="text-sm font-medium text-primary">Under Development</span>
          </div>

          {/* Title & Description */}
          <div className="space-y-4 mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              {title}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              {description}
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

          {/* Features Preview */}
          <div className="mt-12 pt-8 border-t border-foreground/10">
            <p className="text-sm text-muted-foreground mb-6">
              What to expect when we launch:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: "Secure Access", desc: "Industry-standard security" },
                { title: "Easy to Use", desc: "Intuitive interface" },
                { title: "24/7 Support", desc: "Always here to help" },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-background border-2 border-foreground/10 rounded-xl p-4 hover:border-primary/30 transition-colors duration-200"
                >
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
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
