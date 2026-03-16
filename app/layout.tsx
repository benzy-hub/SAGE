import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { AppProviders } from "@/app/providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SAGE - Student Advising & Guidance Environment",
  description:
    "SAGE is a professional, web-based academic advising platform designed to connect students with advisors, streamline appointments, and enhance academic success.",
  keywords: [
    "academic advising",
    "student guidance",
    "university advising",
    "college advising",
    "student support",
    "appointment scheduling",
  ],
  authors: [{ name: "SAGE Team" }],
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "SAGE - Student Advising & Guidance Environment",
    description:
      "Connect with academic advisors, schedule appointments, and track your academic progress with SAGE.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} light`}
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
