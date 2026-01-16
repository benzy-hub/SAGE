"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Card styles matching the exact design: gray, primary, dark alternating pattern
const features = [
  {
    title: "Smart\nScheduling",
    image: "/serviceimgone.svg",
    variant: "gray" as const, // Light gray background
  },
  {
    title: "Secure\nMessaging",
    image: "/serviceimgtwo.svg",
    variant: "primary" as const, // Primary blue background
  },
  {
    title: "Client\nManagement",
    image: "/serviceimgthree.svg",
    variant: "dark" as const, // Dark/black background
  },
  {
    title: "Session\nNotes",
    image: "/serviceimgfour.svg",
    variant: "gray" as const, // Light gray background
  },
  {
    title: "Analytics &\nReports",
    image: "/serviceimgfive.svg",
    variant: "primary" as const, // Primary blue background
  },
  {
    title: "Resource\nLibrary",
    image: "/serviceimgsix.svg",
    variant: "dark" as const, // Dark/black background
  },
];

const variantStyles = {
  gray: {
    card: "bg-[#F3F3F3] border-2 border-foreground",
    title: "bg-primary text-primary-foreground",
    arrow: "bg-foreground",
    arrowIcon: "text-background",
    text: "text-foreground",
  },
  primary: {
    card: "bg-primary border-2 border-foreground",
    title: "bg-background text-foreground",
    arrow: "bg-foreground",
    arrowIcon: "text-background",
    text: "text-primary-foreground",
  },
  dark: {
    card: "bg-foreground border-2 border-foreground",
    title: "bg-primary text-primary-foreground",
    arrow: "bg-background",
    arrowIcon: "text-foreground",
    text: "text-background",
  },
};

export function Features() {
  return (
    <section id="services" className="py-16 sm:py-20 lg:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Exact match to design */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-6 sm:gap-8 mb-10 sm:mb-14">
          <div className="inline-flex items-center justify-center px-4 sm:px-5 py-1.5 sm:py-2 bg-primary rounded-lg self-start">
            <span className="text-xl sm:text-2xl font-medium text-primary-foreground">
              Services
            </span>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
            At our platform, we offer a comprehensive suite of services to help
            organizations and individuals achieve their goals through effective
            guidance and support.
          </p>
        </div>

        {/* Features Grid - 2x3 exact match */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const styles = variantStyles[feature.variant];
            return (
              <div
                key={index}
                className={`${styles.card} rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
              >
                <div className="p-6 sm:p-8 h-full">
                  <div className="flex flex-row justify-between h-full min-h-50 sm:min-h-60">
                    {/* Left: Title and Learn More */}
                    <div className="flex flex-col justify-between">
                      {/* Title with highlight box */}
                      <div>
                        <div
                          className={`inline-block px-2 py-1 rounded-md ${styles.title}`}
                        >
                          <h3 className="text-lg sm:text-xl text-left md:text-center font-semibold tracking-relaxed whitespace-pre-line">
                            {feature.title}
                          </h3>
                        </div>
                      </div>

                      {/* Learn More Link */}
                      <Link
                        href="#"
                        className={`inline-flex items-center gap-3 text-sm sm:text-base font-medium group/link ${styles.text}`}
                      >
                        <span
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-transform group-hover/link:scale-110 ${styles.arrow}`}
                        >
                          <ArrowUpRight
                            className={`w-4 h-4 sm:w-5 sm:h-5 ${styles.arrowIcon}`}
                          />
                        </span>
                        <span className="group-hover/link:underline underline-offset-4">
                          Learn more
                        </span>
                      </Link>
                    </div>

                    {/* Right: Image */}
                    <div className="shrink-0 w-28 sm:w-36 lg:w-44 h-full relative flex items-center justify-center">
                      <Image
                        src={feature.image}
                        alt={feature.title.replace("\n", " ")}
                        width={180}
                        height={180}
                        className="object-contain w-full h-auto max-h-40 sm:max-h-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
