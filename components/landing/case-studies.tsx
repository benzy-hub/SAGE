"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const caseStudies = [
  {
    title: "Client Engagement Platform",
    description:
      "For a large organization, we implemented a comprehensive engagement system that resulted in a 40% increase in client satisfaction and improved retention rates.",
    link: "#",
  },
  {
    title: "Progress Tracking System",
    description:
      "For a growing organization, we deployed real-time progress tracking that helped advisors identify clients needing support early, resulting in a 25% improvement in success rates.",
    link: "#",
  },
  {
    title: "Multi-Location Coordination",
    description:
      "For a multi-location organization, we created a unified advising platform that streamlined communication across departments and improved advisor productivity by 35%.",
    link: "#",
  },
];

export function CaseStudies() {
  return (
    <section id="use-cases" className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center px-4 sm:px-5 py-1.5 sm:py-2 bg-primary rounded-lg self-start">
            <span className="text-xl sm:text-2xl font-medium text-primary-foreground">
              Case Studies
            </span>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md lg:text-right">
            Explore Real-Life Examples of Our Proven Success in Delivering
            Exceptional Guidance and Support
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {caseStudies.map((study, index) => (
            <Card
              key={index}
              className="group bg-foreground border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <CardContent className="p-5 sm:p-6 lg:p-8 flex flex-col min-h-70 sm:min-h-80">
                {/* Title */}
                <h3 className="text-lg sm:text-xl font-semibold text-background mb-4">
                  {study.title}
                </h3>

                {/* Divider */}
                <div className="w-full h-px bg-background/20 mb-4" />

                {/* Description */}
                <p className="text-sm text-background/70 leading-relaxed flex-1 mb-6">
                  {study.description}
                </p>

                {/* Link */}
                <Link
                  href={study.link}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary group/link"
                >
                  <span className="group-hover/link:underline underline-offset-4">
                    Learn more
                  </span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
