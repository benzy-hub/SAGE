// app/auth/layout.tsx
import { PropsWithChildren } from "react";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { User, initializeModels } from "@/lib/db/models";

export default async function AuthLayout({ children }: PropsWithChildren) {
  await connectDB();
  initializeModels();

  const authToken = (await cookies()).get("auth_token")?.value;

  if (authToken) {
    const existingUser = await User.findById(authToken);
    if (existingUser) {
      redirect("/dashboard");
    }
  }

  return (
    <div className="sage-auth-page">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-8 sm:pt-10 pb-6">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <Image
              src="/logo.svg"
              alt="SAGE Logo"
              width={36}
              height={36}
              className="object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <span className="text-xl font-bold text-foreground">SAGE</span>
          </Link>
        </div>

        <div className="mb-6 sm:mb-8 flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6">
          <div className="sage-section-chip self-start">
            <span className="text-xl sm:text-2xl font-medium text-primary-foreground">
              Authentication
            </span>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
            Securely sign in to manage appointments, track academic progress,
            and access personalized guidance.
          </p>
        </div>

        <div className="sage-auth-shell mb-10 sm:mb-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 p-5 sm:p-6 lg:p-8">
            <div className="sage-auth-form-wrap">{children}</div>

            <div className="hidden lg:flex sage-auth-visual">
              <div className="space-y-5">
                <h2 className="text-3xl xl:text-4xl font-bold leading-[1.1] text-foreground">
                  Navigating your academic journey with confidence
                </h2>
                <p className="text-muted-foreground text-base leading-relaxed max-w-md">
                  Join SAGE to schedule sessions, get smart recommendations, and
                  stay connected with advisors in one streamlined platform.
                </p>
              </div>
              <Image
                src="/hero.svg"
                alt="SAGE illustration"
                width={460}
                height={380}
                className="w-full h-auto max-w-md"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
