export type DashboardIconKey =
  | "home"
  | "users"
  | "calendar"
  | "book"
  | "chart"
  | "messages"
  | "settings"
  | "sparkles";

export interface DashboardNavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: DashboardIconKey;
}

export const advisorNavItems: DashboardNavItem[] = [
  {
    href: "/dashboard/advisor",
    label: "Overview",
    shortLabel: "Home",
    icon: "home",
  },
  {
    href: "/dashboard/advisor/advisees",
    label: "Advisees",
    shortLabel: "Advisees",
    icon: "users",
  },
  {
    href: "/dashboard/advisor/appointments",
    label: "Appointments",
    shortLabel: "Schedule",
    icon: "calendar",
  },
  {
    href: "/dashboard/advisor/case-notes",
    label: "Case Notes",
    shortLabel: "Notes",
    icon: "book",
  },
  {
    href: "/dashboard/advisor/insights",
    label: "Insights",
    shortLabel: "Insights",
    icon: "chart",
  },
  {
    href: "/dashboard/advisor/messages",
    label: "Messages",
    shortLabel: "Messages",
    icon: "messages",
  },
  {
    href: "/dashboard/advisor/settings",
    label: "Settings",
    shortLabel: "Settings",
    icon: "settings",
  },
];

export const studentNavItems: DashboardNavItem[] = [
  {
    href: "/dashboard/student",
    label: "Overview",
    shortLabel: "Home",
    icon: "home",
  },
  {
    href: "/dashboard/student/academic-plan",
    label: "Academic Plan",
    shortLabel: "Plan",
    icon: "book",
  },
  {
    href: "/dashboard/student/appointments",
    label: "Appointments",
    shortLabel: "Schedule",
    icon: "calendar",
  },
  {
    href: "/dashboard/student/progress",
    label: "Progress",
    shortLabel: "Progress",
    icon: "chart",
  },
  {
    href: "/dashboard/student/resources",
    label: "Resources",
    shortLabel: "Resources",
    icon: "sparkles",
  },
  {
    href: "/dashboard/student/messages",
    label: "Messages",
    shortLabel: "Messages",
    icon: "messages",
  },
  {
    href: "/dashboard/student/settings",
    label: "Settings",
    shortLabel: "Settings",
    icon: "settings",
  },
];
