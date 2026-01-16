"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export function Contact() {
  const [contactType, setContactType] = useState("say-hi");

  return (
    <section id="contact" className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center px-4 sm:px-5 py-1.5 sm:py-2 bg-primary rounded-lg self-start">
            <span className="text-xl sm:text-2xl font-medium text-primary-foreground">
              Contact Us
            </span>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md">
            Connect with Us: Let&apos;s Discuss Your Advising and Guidance Needs
          </p>
        </div>

        {/* Contact Form Card */}
        <div className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8 xl:p-10 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Form */}
            <div>
              <form className="space-y-5 sm:space-y-6">
                {/* Contact Type Selection */}
                <RadioGroup
                  value={contactType}
                  onValueChange={setContactType}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="say-hi"
                      id="say-hi"
                      className="border-2 border-foreground text-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor="say-hi"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Say Hi
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="get-quote"
                      id="get-quote"
                      className="border-2 border-foreground text-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor="get-quote"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Get a Quote
                    </Label>
                  </div>
                </RadioGroup>

                {/* Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Name"
                    className="h-11 sm:h-12 border-2 border-foreground bg-background focus:border-primary focus:ring-0 text-sm"
                  />
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email*
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    required
                    className="h-11 sm:h-12 border-2 border-foreground bg-background focus:border-primary focus:ring-0 text-sm"
                  />
                </div>

                {/* Message Input */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium">
                    Message*
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Message"
                    required
                    rows={4}
                    className="border-2 border-foreground bg-background focus:border-primary focus:ring-0 resize-none text-sm"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 sm:h-14 bg-foreground text-background hover:bg-foreground/90 font-medium text-sm transition-all duration-200 hover:scale-[1.01]"
                >
                  Send Message
                </Button>
              </form>
            </div>

            {/* Right: Image */}
            <div className="relative hidden lg:flex items-center justify-end rotate-90">
              <div className="relative -mr-8 xl:-mr-10">
                <Image
                  src="/contact.svg"
                  alt="Contact illustration"
                  width={450}
                  height={450}
                  className="w-full max-w-95 xl:max-w-112.5 h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
