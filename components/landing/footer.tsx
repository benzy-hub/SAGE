"use client";

import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const footerLinks = [
  { title: "Services", href: "#services" },
  { title: "How it Works", href: "#how-it-works" },
  { title: "User Roles", href: "#roles" },
  { title: "Use Cases", href: "#use-cases" },
  { title: "Testimonials", href: "#testimonials" },
  { title: "Contact", href: "#contact" },
];

const socialLinks = [
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Twitter",
    href: "https://twitter.com",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
          {/* Logo & Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8 lg:gap-12">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="/logo.svg"
                alt="SAGE Logo"
                width={28}
                height={28}
                className="invert"
              />
              <span className="text-lg font-bold text-background">SAGE</span>
            </Link>

            {/* Navigation Links */}
            <nav className="flex flex-wrap gap-4 sm:gap-6">
              {footerLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="text-sm text-background/70 hover:text-background underline underline-offset-4 transition-colors"
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-background text-foreground hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
                aria-label={social.name}
              >
                {social.icon}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact & Newsletter Section */}
        <div className="mt-8 sm:mt-10 pt-8 sm:pt-10 border-t border-background/10">
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            {/* Contact Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-background mb-3">
                Contact us:
              </h3>
              <div className="space-y-1.5 text-sm text-background/70">
                <p>Email: support@sage.edu</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Address: 123 Academic Drive, University Town, ST 12345</p>
              </div>
            </div>

            {/* Newsletter */}
            <div className="flex flex-col sm:items-end gap-4">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:max-w-md">
                <Input
                  type="email"
                  placeholder="Email"
                  className="h-11 border-0 bg-background/10 text-background placeholder:text-background/50 focus:ring-1 focus:ring-primary text-sm flex-1"
                />
                <Button className="h-11 px-5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-sm whitespace-nowrap transition-all duration-200">
                  Subscribe to news
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-background/50">
              © {new Date().getFullYear()} SAGE. All Rights Reserved.
            </p>
            <Link
              href="/privacy"
              className="text-xs sm:text-sm text-background/50 hover:text-background underline underline-offset-4 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
