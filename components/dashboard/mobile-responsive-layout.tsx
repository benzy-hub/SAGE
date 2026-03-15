import { ReactNode } from "react";

interface MobileResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MobileResponsiveLayout({
  children,
  className = "",
}: MobileResponsiveLayoutProps) {
  return (
    <div className={`w-full h-full overflow-hidden ${className}`}>
      {/* Mobile optimized for touch */}
      <div className="md:hidden w-full h-full">{children}</div>

      {/* Tablet and Desktop */}
      <div className="hidden md:block w-full h-full">{children}</div>
    </div>
  );
}
