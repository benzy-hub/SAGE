"use client";

import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    quote:
      "We have been working with SAGE for the past year and have seen a tremendous increase in client engagement and retention as a result of their efforts. The team is always responsive, and I highly recommend them to any organization looking to grow their advising capabilities.",
    author: "John Smith",
    role: "Director of Client Services",
  },
  {
    quote:
      "SAGE has transformed how we approach client guidance. Their platform is intuitive and has significantly reduced our response times. Our advisors can now focus on what matters most - helping clients succeed.",
    author: "Sarah Johnson",
    role: "Operations Manager",
  },
  {
    quote:
      "The implementation was seamless and the support team was exceptional. We've seen a 40% increase in client satisfaction scores since adopting SAGE. It's been a game-changer for our organization.",
    author: "Michael Chen",
    role: "VP of Operations",
  },
  {
    quote:
      "As a guidance coordinator, SAGE has made my job so much easier. I can now track client progress in real-time and provide timely support when needed.",
    author: "Emily Rodriguez",
    role: "Client Success Coordinator",
  },
  {
    quote:
      "The analytics and reporting features have given us unprecedented insights into our advising operations. We can now make data-driven decisions to improve client outcomes.",
    author: "David Martinez",
    role: "Director of Analytics",
  },
  {
    quote:
      "SAGE's appointment scheduling system has eliminated double-bookings and scheduling conflicts. Our advisors are more productive than ever before.",
    author: "Patricia Williams",
    role: "Senior Advisor",
  },
];

export function Testimonials() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 380;
      const newScrollLeft =
        direction === "left"
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      id="testimonials"
      className="py-16 sm:py-20 lg:py-24 bg-background"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 sm:gap-8 mb-10 sm:mb-14">
          <div className="inline-flex items-center justify-center px-4 sm:px-5 py-1.5 sm:py-2 bg-primary rounded-lg self-start">
            <span className="text-xl sm:text-2xl font-medium text-primary-foreground">
              Testimonials
            </span>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
            Hear from Our Satisfied Clients: Read Our Testimonials to Learn More
            about Our Academic Advising Services
          </p>
        </div>
      </div>

      {/* Testimonials Slider - Full width container */}
      <div className="w-full overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={scrollContainerRef}
            className="flex gap-5 sm:gap-6 overflow-x-auto pb-4"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-foreground border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:shadow-xl w-75 sm:w-95 shrink-0"
              >
                <CardContent className="p-6 sm:p-8 flex flex-col h-full min-h-80 sm:min-h-85">
                  {/* Quote Text */}
                  <blockquote className="text-sm sm:text-base text-background/90 leading-relaxed flex-1 mb-6">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>

                  {/* Divider */}
                  <div className="w-full h-px bg-background/20 mb-4" />

                  {/* Author Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-base sm:text-lg font-semibold text-primary-foreground">
                        {testimonial.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm sm:text-base text-primary">
                        {testimonial.author}
                      </div>
                      <div className="text-xs sm:text-sm text-background/70 leading-tight">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end gap-3 sm:gap-4 mt-8 sm:mt-10">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("left")}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-foreground bg-background hover:bg-foreground hover:text-background transition-all duration-200 hover:scale-110"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("right")}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-foreground bg-foreground hover:bg-primary text-background transition-all duration-200 hover:scale-110"
            aria-label="Next testimonials"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>
      </div>
    </section>
  );
}
