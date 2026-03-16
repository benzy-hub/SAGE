"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const features = ["Scheduling", "Guidance", "Progress", "Support"];

type CtaConfig = {
  href: string;
  label: string;
};

function getCtaConfig(role: string | null): CtaConfig {
  switch (role) {
    case "ADMIN":
      return { href: "/dashboard/admin", label: "Go to Admin Dashboard" };
    case "ADVISOR":
      return { href: "/dashboard/advisor", label: "Go to Advisor Dashboard" };
    case "STUDENT":
      return { href: "/dashboard/student", label: "Go to Your Dashboard" };
    default:
      return { href: "/auth/signup", label: "Get Started" };
  }
}

export function Hero() {
  const [role, setRole] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.user?.role) setRole(d.user.role as string);
      })
      .catch(() => {})
      .finally(() => setResolved(true));
  }, []);

  const cta = getCtaConfig(role);

  return (
    <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto sm:mt-12">
          <div className="w-full lg:max-w-xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] font-bold tracking-tight text-foreground leading-[1.1] mb-4 sm:mb-6">
              Navigating the guidance landscape for success
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Our comprehensive advising platform empowers organizations to
              deliver exceptional guidance and support through seamless
              appointment scheduling, progress tracking, and personalized
              engagement.
            </p>

            <Button
              size="lg"
              className="rounded-xl px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base bg-foreground text-background hover:bg-foreground/90 font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
              asChild
              disabled={!resolved}
            >
              <Link href={resolved ? cta.href : "#"}>
                {resolved ? cta.label : "Loading…"}
              </Link>
            </Button>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-100 sm:max-w-md lg:max-w-lg">
              <Image
                src="/hero.svg"
                alt="SAGE Hero Illustration"
                width={600}
                height={515}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 lg:mt-20 max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-base sm:text-lg lg:text-xl font-bold text-foreground/60 hover:text-primary transition-colors duration-200 cursor-default"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
