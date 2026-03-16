import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeatureDetail {
  title: string;
  tagline: string;
  description: string;
  image: string;
  benefits: string[];
  howItWorks: { step: string; detail: string }[];
  cta: string;
}

const featureData: Record<string, FeatureDetail> = {
  "smart-scheduling": {
    title: "Smart Scheduling",
    tagline: "Book the right time, every time.",
    description:
      "SAGE's intelligent scheduling engine lets advisors set their available time slots and students pick a slot that works — eliminating back-and-forth emails and double bookings. Whether recurring weekly windows or one-off availability, every session is planned with precision.",
    image: "/serviceimgone.svg",
    benefits: [
      "Advisors define recurring weekly slots or one-off openings",
      "Students see only genuinely available times — no guesswork",
      "Automatic conflict detection prevents double-bookings",
      "Calendar sync keeps everyone on the same page",
      "Reminders sent automatically before each session",
      "Works across time zones for remote advising",
    ],
    howItWorks: [
      {
        step: "Advisor sets availability",
        detail:
          "Advisors open the Availability tab and add weekly recurring slots (e.g., Mondays 9–10 AM) or specific date/time openings.",
      },
      {
        step: "Student requests a session",
        detail:
          "Students browse their advisor's open slots and select one that suits them, then add a brief agenda.",
      },
      {
        step: "Appointment confirmed",
        detail:
          "The system marks the slot as booked, notifies both parties, and adds the session to both dashboards.",
      },
      {
        step: "Session complete",
        detail:
          "After the meeting, the advisor marks it as completed and can log notes. The student is prompted to leave a rating.",
      },
    ],
    cta: "Start scheduling smarter",
  },
  "secure-messaging": {
    title: "Secure Messaging",
    tagline: "Every conversation, protected and preserved.",
    description:
      "SAGE's built-in messaging system gives students and advisors a dedicated, private channel to communicate between sessions. No external apps, no lost emails — just structured, on-record conversations tied to each advising relationship.",
    image: "/serviceimgtwo.svg",
    benefits: [
      "One-to-one messaging tied to each advisor–student connection",
      "All messages stored securely and auditable",
      "Real-time delivery with unread indicators",
      "No need for external chat tools or email threads",
      "Accessible from any device",
      "Conversation history always available for context",
    ],
    howItWorks: [
      {
        step: "Connect with your advisor or student",
        detail:
          "Once a connection is established, a direct message channel opens automatically.",
      },
      {
        step: "Send and receive messages",
        detail:
          "Either party can start a conversation at any time from the Messages section of their dashboard.",
      },
      {
        step: "Stay notified",
        detail:
          "Unread message counts appear on the dashboard navigation so nothing slips through.",
      },
      {
        step: "Review history",
        detail:
          "The full conversation thread is always available, providing context for every future session.",
      },
    ],
    cta: "Connect securely today",
  },
  "client-management": {
    title: "Client Management",
    tagline: "Every student's story, in one place.",
    description:
      "Advisors get a unified view of every student they work with — their appointment history, session notes, academic progress, and messages — all organised in a clean client profile. No more juggling spreadsheets or scattered files.",
    image: "/serviceimgthree.svg",
    benefits: [
      "Centralised profile for each student with full history",
      "Instant access to past sessions and notes",
      "Quick overview of each student's academic standing",
      "Easy to filter and sort your full student list",
      "Students can track their own progress too",
      "All data persisted securely in the cloud",
    ],
    howItWorks: [
      {
        step: "Student requests a connection",
        detail:
          "Students browse available advisors and send a connection request. Advisors accept to establish the relationship.",
      },
      {
        step: "Shared dashboard access",
        detail:
          "Both parties see the relationship in their dashboards with quick links to book, message, and review.",
      },
      {
        step: "Advisors build a profile",
        detail:
          "With each session, the advisor's notes and the student's record grow richer, giving a full longitudinal view.",
      },
      {
        step: "Holistic guidance",
        detail:
          "Armed with full context, advisors can provide highly personalised support in every interaction.",
      },
    ],
    cta: "Manage your students better",
  },
  "session-notes": {
    title: "Session Notes",
    tagline: "Capture insights. Never lose context.",
    description:
      "Structured session notes let advisors record key outcomes, agreed actions, and follow-up items immediately after each meeting. Notes are attached to the appointment record and always available to the advisor — building a living record of each student's journey.",
    image: "/serviceimgfour.svg",
    benefits: [
      "Notes saved against each appointment for easy retrieval",
      "Rich-text editing for structured, readable records",
      "Instant access to past notes before every session",
      "Supports follow-up action tracking",
      "Reduces cognitive load by externalising key information",
      "Compliant and auditable record-keeping",
    ],
    howItWorks: [
      {
        step: "Session takes place",
        detail:
          "The advisor meets the student as scheduled via their chosen channel.",
      },
      {
        step: "Advisor adds notes",
        detail:
          "From the Sessions tab, the advisor clicks into the completed appointment and types their notes inline — no separate tool needed.",
      },
      {
        step: "Notes auto-saved",
        detail:
          "Notes are saved automatically when the advisor clicks away, ensuring nothing is lost.",
      },
      {
        step: "Context available next time",
        detail:
          "Before the next session the advisor can review previous notes to pick up exactly where they left off.",
      },
    ],
    cta: "Start taking better notes",
  },
  "analytics-reports": {
    title: "Analytics & Reports",
    tagline: "Data that drives better outcomes.",
    description:
      "SAGE's analytics layer surfaces meaningful patterns — session frequency, completion rates, advisor ratings, and student engagement — giving advisors, administrators, and students the visibility they need to make better decisions.",
    image: "/serviceimgfive.svg",
    benefits: [
      "At-a-glance metrics on your personal dashboard",
      "Session completion and cancellation trends",
      "Advisor rating breakdown with written reviews",
      "Admin-level overview of platform-wide activity",
      "Identify at-risk students through engagement signals",
      "Exportable data for institutional reporting",
    ],
    howItWorks: [
      {
        step: "Data collected automatically",
        detail:
          "Every appointment, message, rating, and note contributes to the analytics layer without any manual input.",
      },
      {
        step: "Dashboard metrics surfaced",
        detail:
          "Each role sees metrics most relevant to them — students see their own activity, advisors see their client roster, admins see the full picture.",
      },
      {
        step: "Ratings and reviews aggregated",
        detail:
          "Students rate completed sessions; the system computes rolling averages and histograms for advisor profiles.",
      },
      {
        step: "Insights drive action",
        detail:
          "Administrators use platform data to allocate resources, identify gaps, and improve the advising service.",
      },
    ],
    cta: "Unlock your data",
  },
  "resource-library": {
    title: "Resource Library",
    tagline: "The right guidance, always within reach.",
    description:
      "A curated collection of academic resources, guides, templates, and reference materials shared by advisors and administrators. Students find what they need without having to ask, freeing advisors to focus on higher-value conversations.",
    image: "/serviceimgsix.svg",
    benefits: [
      "Centralised library accessible from every dashboard",
      "Advisors can upload and tag documents for easy discovery",
      "Students browse or search for relevant materials",
      "Reduces repetitive informational questions",
      "Supports self-directed academic development",
      "Always up to date — managed by your institution",
    ],
    howItWorks: [
      {
        step: "Advisors and admins upload resources",
        detail:
          "Documents, guides, and templates are uploaded to the library with descriptive tags and categories.",
      },
      {
        step: "Students browse or search",
        detail:
          "Students access the library from their dashboard and find materials using keyword search or category filters.",
      },
      {
        step: "Advisors recommend items",
        detail:
          "During or after a session, advisors can direct students to specific library items relevant to their situation.",
      },
      {
        step: "Library stays fresh",
        detail:
          "Admins review and update library content regularly to ensure accuracy and relevance.",
      },
    ],
    cta: "Explore the library",
  },
};

export function generateStaticParams() {
  return Object.keys(featureData).map((slug) => ({ slug }));
}

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const feature = featureData[slug];
  if (!feature) notFound();

  return (
    <main className="min-h-screen bg-background">
      {/* Back nav */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/#services"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Link>
      </div>

      {/* Hero */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">
          <div>
            <div className="inline-flex items-center justify-center px-4 py-1.5 bg-primary rounded-lg mb-6">
              <span className="text-sm font-medium text-primary-foreground">
                SAGE Feature
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
              {feature.title}
            </h1>
            <p className="text-lg sm:text-xl text-primary font-medium mb-4">
              {feature.tagline}
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-8">
              {feature.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-8 h-12 font-medium"
                asChild
              >
                <Link href="/auth/signup">{feature.cta}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl px-8 h-12 font-medium border-2 border-foreground"
                asChild
              >
                <Link href="/#contact">Talk to us</Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <Image
              src={feature.image}
              alt={feature.title}
              width={400}
              height={400}
              className="w-full max-w-sm lg:max-w-md h-auto"
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-secondary border-y-2 border-foreground py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-10 text-center">
            Why it matters
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {feature.benefits.map((benefit, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-background rounded-2xl p-4 border border-foreground/10 hover:shadow-sm transition-shadow"
              >
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground leading-relaxed">
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 max-w-5xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-10 text-center">
          How it works
        </h2>
        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {feature.howItWorks.map((item, i) => (
            <div
              key={i}
              className="relative bg-secondary border-2 border-foreground rounded-[2rem] p-6 sm:p-8"
            >
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base mb-4">
                {i + 1}
              </div>
              <h3 className="font-semibold text-base text-foreground mb-2">
                {item.step}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-foreground py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-background mb-4">
            Ready to experience {feature.title}?
          </h2>
          <p className="text-background/70 mb-8 max-w-lg mx-auto text-sm sm:text-base">
            Join Bowen University students and advisors already using SAGE to
            make every advising session count.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 h-12 font-medium"
              asChild
            >
              <Link href="/auth/signup">Get started free</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-background hover:bg-background hover:text-foreground rounded-xl px-8 h-12 font-medium"
              asChild
            >
              <Link href="/#services">See all features</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
