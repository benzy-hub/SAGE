"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Minimum display time for the loader
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Fade out animation delay
      setTimeout(() => {
        setIsVisible(false);
      }, 500);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center bg-background transition-opacity duration-500 ${
        isLoading ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Rotating Logo */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24">
          <div className="absolute inset-0 animate-spin-slow">
            <Image
              src="/logo.svg"
              alt="SAGE Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Brand Name */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            SAGE
          </h1>
          <p className="text-sm text-muted-foreground">
            Loading your experience...
          </p>
        </div>

        {/* Loading Bar */}
        <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-loading-bar" />
        </div>
      </div>
    </div>
  );
}
