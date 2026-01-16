"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LetsMakeItHappen() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground mb-4 sm:mb-6">
                Let&apos;s make things happen
              </h2>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 sm:mb-8">
                Contact us today to learn more about how our advising services
                can help your organization grow and succeed in delivering
                exceptional guidance and support.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="h-12 border-2 border-foreground bg-background focus:border-primary focus:ring-0 text-sm flex-1"
                />
                <Button className="h-12 px-6 bg-foreground text-background hover:bg-foreground/90 font-medium text-sm whitespace-nowrap transition-all duration-200">
                  Get your free proposal
                </Button>
              </div>
            </div>

            {/* Right Content - Image */}
            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="relative">
                <Image
                  src="/letsmakeit.svg"
                  alt="Let's make it happen illustration"
                  width={250}
                  height={250}
                  className="w-full max-w-70 h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
