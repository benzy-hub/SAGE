"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Loader2, Mail, Quote } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ContactType = "say-hi" | "get-quote";
type QuoteCategory =
  | "general"
  | "focus"
  | "discipline"
  | "courage"
  | "success"
  | "fresh-start"
  | "academics";

const requestTypeOptions: Array<{ value: ContactType; label: string }> = [
  { value: "say-hi", label: "Say Hi" },
  { value: "get-quote", label: "Get a motivational quote" },
];

const quoteCategoryOptions: Array<{ value: QuoteCategory; label: string }> = [
  { value: "general", label: "General motivation" },
  { value: "focus", label: "Focus" },
  { value: "discipline", label: "Discipline" },
  { value: "courage", label: "Courage" },
  { value: "success", label: "Success" },
  { value: "fresh-start", label: "Fresh start" },
  { value: "academics", label: "Academics" },
];

export function Contact() {
  const [contactType, setContactType] = useState<ContactType>("say-hi");
  const [quoteCategory, setQuoteCategory] = useState<QuoteCategory>("general");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [receivedQuote, setReceivedQuote] = useState("");
  const [receivedAuthor, setReceivedAuthor] = useState("");
  const [emailDelivered, setEmailDelivered] = useState(false);

  const isQuote = contactType === "get-quote";

  const selectedQuoteLabel = useMemo(
    () =>
      quoteCategoryOptions.find((option) => option.value === quoteCategory)
        ?.label ?? "General motivation",
    [quoteCategory],
  );

  useEffect(() => {
    const applyPrefill = () => {
      try {
        const raw = window.sessionStorage.getItem("sage-contact-prefill");
        if (!raw) return;

        const parsed = JSON.parse(raw) as {
          type?: ContactType;
          quoteCategory?: QuoteCategory;
          email?: string;
          message?: string;
        };

        if (parsed.type) setContactType(parsed.type);
        if (parsed.quoteCategory) setQuoteCategory(parsed.quoteCategory);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.message) setMessage(parsed.message);
      } catch {
        // ignore invalid prefill payload
      }
    };

    applyPrefill();
    window.addEventListener("sage-prefill-contact", applyPrefill);
    return () => {
      window.removeEventListener("sage-prefill-contact", applyPrefill);
    };
  }, []);

  const clearPrefill = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("sage-contact-prefill");
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setMessage("");
    setContactType("say-hi");
    setQuoteCategory("general");
    setSubmitted(false);
    setReceivedQuote("");
    setReceivedAuthor("");
    setEmailDelivered(false);
    clearPrefill();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || (!isQuote && !message.trim())) {
      toast.error("Please fill in all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          type: contactType,
          quoteCategory,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to submit request");

      setSubmitted(true);
      setReceivedQuote(typeof data?.quote === "string" ? data.quote : "");
      setReceivedAuthor(typeof data?.author === "string" ? data.author : "");
      setEmailDelivered(Boolean(data?.emailDelivered));
      clearPrefill();

      toast.success(
        isQuote
          ? data?.emailDelivered
            ? "Quote generated and emailed successfully."
            : "Quote generated. Email delivery could not be confirmed."
          : "Message sent. You can view it in admin support.",
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center px-4 sm:px-5 py-1.5 sm:py-2 bg-primary rounded-lg self-start">
            <span className="text-xl sm:text-2xl font-medium text-primary-foreground">
              Contact Us
            </span>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md">
            Say hello, send feedback, or receive a motivational quote by email
            in the tone you need most.
          </p>
        </div>

        <div className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8 xl:p-10 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {isQuote ? "Your quote is ready ✨" : "Message received!"}
                  </h3>
                  {isQuote ? (
                    <>
                      <div className="max-w-md w-full rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 text-left">
                        <div className="flex items-start gap-3">
                          <Quote className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <div className="space-y-2">
                            <p className="text-sm text-foreground leading-relaxed">
                              {receivedQuote ||
                                "Keep showing up for yourself — that alone is a powerful kind of progress."}
                            </p>
                            {receivedAuthor && (
                              <p className="text-xs text-muted-foreground">
                                — {receivedAuthor}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="max-w-md w-full rounded-2xl border border-foreground/10 bg-background px-5 py-4 text-left">
                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {emailDelivered
                              ? `We also sent this ${selectedQuoteLabel.toLowerCase()} quote to ${email}.`
                              : `We generated your ${selectedQuoteLabel.toLowerCase()} quote here, but email delivery could not be confirmed right now.`}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Your “Say Hi” message has been saved and is visible in the
                      admin support queue.
                    </p>
                  )}
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="mt-2"
                  >
                    {isQuote ? "Get another quote" : "Send another message"}
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 sm:space-y-6"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="request-type"
                      className="text-sm font-medium"
                    >
                      What would you like today?
                    </Label>
                    <Select
                      value={contactType}
                      onValueChange={(value) =>
                        setContactType(value as ContactType)
                      }
                    >
                      <SelectTrigger
                        id="request-type"
                        className="w-full h-11 sm:h-12 border-2 border-foreground bg-background text-sm"
                      >
                        <SelectValue placeholder="Select request type" />
                      </SelectTrigger>
                      <SelectContent>
                        {requestTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {isQuote && (
                    <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          Choose the kind of quote you want
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Pick a theme and we’ll generate a professional
                          motivational quote, show it here, and send it to your
                          email.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="quote-category"
                          className="text-sm font-medium"
                        >
                          Quote theme
                        </Label>
                        <Select
                          value={quoteCategory}
                          onValueChange={(value) =>
                            setQuoteCategory(value as QuoteCategory)
                          }
                        >
                          <SelectTrigger
                            id="quote-category"
                            className="w-full h-11 sm:h-12 border-2 border-foreground bg-background text-sm"
                          >
                            <SelectValue placeholder="Select quote theme" />
                          </SelectTrigger>
                          <SelectContent>
                            {quoteCategoryOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required
                      className="h-11 sm:h-12 border-2 border-foreground bg-background focus:border-primary focus:ring-0 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="h-11 sm:h-12 border-2 border-foreground bg-background focus:border-primary focus:ring-0 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium">
                      {isQuote ? "Optional note for your quote" : "Message"}
                      {!isQuote && <span className="text-destructive"> *</span>}
                    </Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        isQuote
                          ? "Optional: tell us what you're facing — exams, consistency, confidence, a fresh start…"
                          : "How can we help you?"
                      }
                      required={!isQuote}
                      rows={4}
                      className="border-2 border-foreground bg-background focus:border-primary focus:ring-0 resize-none text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    className="w-full h-12 sm:h-14 bg-foreground text-background hover:bg-foreground/90 font-medium text-sm transition-all duration-200 hover:scale-[1.01] gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting
                      ? "Sending…"
                      : isQuote
                        ? "Generate and email my quote"
                        : "Send Message"}
                  </Button>
                </form>
              )}
            </div>

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
