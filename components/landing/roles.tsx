"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, Settings } from "lucide-react";

const roles = [
  {
    icon: GraduationCap,
    title: "Clients",
    subtitle: "Comprehensive Client Portal",
    description:
      "Empower clients with easy access to their profiles, appointment scheduling, direct advisor communication, and a wealth of support resources—all in one intuitive platform.",
    features: [
      "Personal Profile Management",
      "Appointment Scheduling",
      "Direct Advisor Messaging",
      "Support Resources & FAQs",
    ],
    variant: "gray" as const,
  },
  {
    icon: Users,
    title: "Advisors",
    subtitle: "Powerful Advising Tools",
    description:
      "Equip advisors with comprehensive tools to manage assigned clients, handle appointment requests efficiently, maintain detailed session notes, and track progress seamlessly.",
    features: [
      "Client Management Dashboard",
      "Appointment Coordination",
      "Session Notes & History",
      "Progress Tracking Tools",
    ],
    variant: "primary" as const,
  },
  {
    icon: Settings,
    title: "Administrators",
    subtitle: "Complete System Control",
    description:
      "Provide administrators with full oversight through user management, advisor assignments, content control, detailed analytics, and comprehensive reporting capabilities.",
    features: [
      "User & Role Management",
      "Advisor Assignment Tools",
      "Content Management",
      "Analytics & Reporting",
    ],
    variant: "dark" as const,
  },
];

const variantStyles = {
  gray: {
    card: "bg-[#F3F3F3]",
    icon: "bg-primary",
    iconColor: "text-primary-foreground",
    title: "text-foreground",
    subtitle: "text-primary",
    description: "text-muted-foreground",
    divider: "bg-foreground/10",
    featuresTitle: "text-foreground",
    featuresBullet: "bg-primary",
    featuresText: "text-muted-foreground",
  },
  primary: {
    card: "bg-primary",
    icon: "bg-background",
    iconColor: "text-primary",
    title: "text-primary-foreground",
    subtitle: "text-background",
    description: "text-primary-foreground/90",
    divider: "bg-primary-foreground/20",
    featuresTitle: "text-primary-foreground",
    featuresBullet: "bg-background",
    featuresText: "text-primary-foreground/90",
  },
  dark: {
    card: "bg-foreground",
    icon: "bg-primary",
    iconColor: "text-primary-foreground",
    title: "text-background",
    subtitle: "text-primary",
    description: "text-background/80",
    divider: "bg-background/10",
    featuresTitle: "text-background",
    featuresBullet: "bg-primary",
    featuresText: "text-background/80",
  },
};

export function Roles() {
  return (
    <section id="roles" className="py-16 sm:py-20 lg:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-6 sm:gap-8 mb-10 sm:mb-14">
          <div className="inline-flex items-center justify-center px-4 sm:px-5 py-1.5 sm:py-2 bg-primary rounded-lg self-start">
            <span className="text-xl sm:text-2xl font-medium text-primary-foreground">
              User Roles
            </span>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            SAGE is designed to serve the unique needs of every stakeholder in
            the advising ecosystem. Explore how each role benefits from our
            comprehensive platform.
          </p>
        </div>

        {/* Roles Grid - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const styles = variantStyles[role.variant];
            return (
              <Card
                key={index}
                className={`group ${styles.card} border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
              >
                <CardContent className="p-6 sm:p-8 h-full flex flex-col">
                  {/* Icon Header */}
                  <div className="mb-6">
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${styles.icon} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}
                    >
                      <Icon
                        className={`w-8 h-8 sm:w-10 sm:h-10 ${styles.iconColor}`}
                        strokeWidth={1.5}
                      />
                    </div>
                    <h3
                      className={`text-xl sm:text-2xl font-bold ${styles.title} mb-1`}
                    >
                      {role.title}
                    </h3>
                    <p
                      className={`text-sm sm:text-base ${styles.subtitle} font-medium`}
                    >
                      {role.subtitle}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className={`w-full h-px ${styles.divider} mb-6`} />

                  {/* Description */}
                  <p
                    className={`text-sm sm:text-base ${styles.description} leading-relaxed mb-6`}
                  >
                    {role.description}
                  </p>

                  {/* Features List */}
                  <div className="mt-auto space-y-3">
                    <p
                      className={`text-xs font-semibold ${styles.featuresTitle} uppercase tracking-wider mb-3`}
                    >
                      Key Features
                    </p>
                    <ul className="space-y-2">
                      {role.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className={`flex items-start gap-2 text-sm ${styles.featuresText}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${styles.featuresBullet} mt-1.5 flex-shrink-0`}
                          ></span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
