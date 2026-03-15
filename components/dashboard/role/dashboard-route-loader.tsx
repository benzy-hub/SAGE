import Image from "next/image";

interface DashboardRouteLoaderProps {
  title: string;
  subtitle: string;
}

export function DashboardRouteLoader({
  title,
  subtitle,
}: DashboardRouteLoaderProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-secondary border-2 border-foreground rounded-[2rem] p-6 sm:p-8 text-center">
        <div className="relative w-18 h-18 sm:w-22 sm:h-22 mx-auto">
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

        <div className="mt-6">
          <p className="text-sm font-medium text-primary">{title}</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">
            Preparing your workspace
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="mt-6 h-2 bg-background rounded-full overflow-hidden border border-foreground/10">
          <div className="h-full bg-primary rounded-full animate-loading-bar" />
        </div>
      </div>
    </div>
  );
}
