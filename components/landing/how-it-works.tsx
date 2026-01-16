"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Consultation",
    description:
      "During the initial consultation, we will discuss your organization's goals and objectives, target audience, and current advising efforts. This will allow us to understand your needs and tailor our services to best fit your requirements.",
  },
  {
    number: "02",
    title: "Research and Strategy Development",
    description:
      "Our team conducts thorough research on your organization's landscape, client demographics, and advising challenges. We then develop a comprehensive strategy to enhance your advising services.",
  },
  {
    number: "03",
    title: "Implementation",
    description:
      "We work closely with your team to implement the advising platform, including system setup, data migration, and integration with existing tools. Our experts ensure a smooth transition with minimal disruption.",
  },
  {
    number: "04",
    title: "Monitoring and Optimization",
    description:
      "Once implemented, we continuously monitor the system's performance, gathering feedback from users and analyzing metrics to identify areas for improvement and optimization.",
  },
  {
    number: "05",
    title: "Reporting and Communication",
    description:
      "We provide regular reports on advising activities, client engagement, and system usage. Our team maintains open communication to address any concerns and celebrate successes.",
  },
  {
    number: "06",
    title: "Continual Improvement",
    description:
      "Professional advising is an ongoing journey. We continuously refine our approach based on feedback, emerging best practices, and evolving organizational needs to ensure long-term success.",
  },
];

export function HowItWorks() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section
      id="how-it-works"
      className="py-12 sm:py-16 lg:py-20 bg-background"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6 mb-8 sm:mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center px-4 sm:px-5 py-1.5 sm:py-2 bg-primary rounded-lg self-start">
            <span className="text-xl sm:text-2xl font-medium text-primary-foreground">
              Our Working Process
            </span>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-sm lg:text-right">
            Step-by-Step Guide to Achieving Your Goals
          </p>
        </div>

        {/* Accordion Steps */}
        <div className="space-y-3 sm:space-y-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden transition-all duration-500 ease-out animate-fade-in ${
                openIndex === index
                  ? "bg-primary shadow-lg"
                  : "bg-secondary hover:shadow-md"
              }`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full px-5 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
                  <span
                    className={`text-3xl sm:text-4xl lg:text-5xl font-bold transition-colors duration-300 ${
                      openIndex === index
                        ? "text-primary-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {step.number}
                  </span>
                  <h3
                    className={`text-base sm:text-lg lg:text-xl font-semibold transition-colors duration-300 ${
                      openIndex === index
                        ? "text-primary-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {step.title}
                  </h3>
                </div>
                <div
                  className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    openIndex === index
                      ? "border-primary-foreground/30 bg-primary-foreground/10"
                      : "border-foreground bg-background"
                  }`}
                >
                  {openIndex === index ? (
                    <Minus
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${
                        openIndex === index
                          ? "text-primary-foreground"
                          : "text-foreground"
                      }`}
                    />
                  ) : (
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                  )}
                </div>
              </button>

              <div
                className={`grid transition-all duration-500 ease-out ${
                  openIndex === index
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-5 sm:px-6 lg:px-8 pb-5 sm:pb-6 lg:pb-8">
                    <div
                      className={`w-full h-px mb-4 sm:mb-5 transition-colors duration-300 ${
                        openIndex === index
                          ? "bg-primary-foreground/20"
                          : "bg-foreground/20"
                      }`}
                    />
                    <p
                      className={`text-sm sm:text-base leading-relaxed pl-0 sm:pl-12 lg:pl-20 transition-colors duration-300 ${
                        openIndex === index
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
