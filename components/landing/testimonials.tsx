"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  PenLine,
  Trash2,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TestimonialItem {
  _id: string;
  authorName: string;
  authorTitle?: string;
  authorRole: string;
  quote: string;
  rating: number;
  isApproved: boolean;
  isPublished: boolean;
}

const STATIC_TESTIMONIALS: TestimonialItem[] = [
  {
    _id: "s1",
    authorName: "Chidera Okafor",
    authorTitle: "Computer Science Student, 300L",
    authorRole: "STUDENT",
    quote:
      "SAGE has completely transformed my academic journey. My advisor helped me plan the perfect course load and I no longer feel lost navigating university requirements.",
    rating: 5,
    isApproved: true,
    isPublished: true,
  },
  {
    _id: "s2",
    authorName: "Dr. Adebayo Akinola",
    authorTitle: "Academic Advisor, COAES",
    authorRole: "ADVISOR",
    quote:
      "The appointment scheduling and case notes system saves me hours every week. I can focus entirely on helping my students rather than administrative tasks.",
    rating: 5,
    isApproved: true,
    isPublished: true,
  },
  {
    _id: "s3",
    authorName: "Zainab Ibrahim",
    authorTitle: "Law Student, 200L",
    authorRole: "STUDENT",
    quote:
      "Being able to track my academic plan and get real-time guidance from my advisor has been invaluable. I feel fully supported throughout my studies at Bowen.",
    rating: 5,
    isApproved: true,
    isPublished: true,
  },
  {
    _id: "s4",
    authorName: "Samuel Nwankwo",
    authorTitle: "Mechanical Engineering Student",
    authorRole: "STUDENT",
    quote:
      "The messaging feature makes it so easy to reach my advisor between sessions. Quick responses mean I never stay stuck on a problem for long.",
    rating: 4,
    isApproved: true,
    isPublished: true,
  },
  {
    _id: "s5",
    authorName: "Dr. Ifeoma Eze",
    authorTitle: "Senior Academic Advisor",
    authorRole: "ADVISOR",
    quote:
      "The analytics dashboard gives me unprecedented insight into each student's progress. I can provide truly personalised guidance now.",
    rating: 5,
    isApproved: true,
    isPublished: true,
  },
  {
    _id: "s6",
    authorName: "Favour Ogunleye",
    authorTitle: "Nursing Science Student, 400L",
    authorRole: "STUDENT",
    quote:
      "I used to dread registration periods. With SAGE my advisor already has everything prepared and we just review and finalise together in minutes.",
    rating: 5,
    isApproved: true,
    isPublished: true,
  },
];

function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= value ? "fill-amber-400 text-amber-400" : "text-background/30"}`}
        />
      ))}
    </div>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="cursor-pointer hover:scale-110 transition-transform"
        >
          <Star
            className={`w-6 h-6 ${s <= (hovered || value) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
          />
        </button>
      ))}
    </div>
  );
}

export function Testimonials() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [testimonials, setTestimonials] =
    useState<TestimonialItem[]>(STATIC_TESTIMONIALS);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [myTestimonials, setMyTestimonials] = useState<TestimonialItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [authorTitle, setAuthorTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState("");

  const refreshMine = async () => {
    try {
      const d = await fetch("/api/testimonials?mine=true").then((r) =>
        r.json(),
      );
      setMyTestimonials((d?.testimonials ?? []) as TestimonialItem[]);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetch("/api/testimonials")
      .then((r) => r.json())
      .then((d) => {
        const items = (d?.testimonials ?? []) as TestimonialItem[];
        if (items.length > 0) setTestimonials(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.user) {
          setIsAuthenticated(true);
          void refreshMine();
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const amount = 380;
      scrollContainerRef.current.scrollTo({
        left:
          direction === "left"
            ? scrollContainerRef.current.scrollLeft - amount
            : scrollContainerRef.current.scrollLeft + amount,
        behavior: "smooth",
      });
    }
  };

  const openCreate = () => {
    setEditingId("");
    setQuote("");
    setRating(5);
    setAuthorTitle("");
    setShowForm(true);
  };

  const startEdit = (t: TestimonialItem) => {
    setEditingId(t._id);
    setQuote(t.quote);
    setRating(t.rating);
    setAuthorTitle(t.authorTitle ?? "");
    setShowForm(true);
    document
      .getElementById("testimonials")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId("");
  };

  const submitTestimonial = async () => {
    if (!quote.trim()) {
      toast.error("Please enter your testimonial text");
      return;
    }
    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/testimonials/${editingId}`
        : "/api/testimonials";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote: quote.trim(), rating, authorTitle }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to submit");
      toast.success(
        editingId
          ? "Testimonial updated — awaiting admin review"
          : "Thank you! Your testimonial is pending admin review.",
      );
      cancelForm();
      await refreshMine();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit testimonial",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm("Delete this testimonial? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to delete");
      toast.success("Testimonial deleted");
      setMyTestimonials((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <section
      id="testimonials"
      className="py-16 sm:py-20 lg:py-24 bg-background"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 sm:gap-8 mb-10 sm:mb-14">
          <div className="inline-flex items-center justify-center px-4 sm:px-5 py-1.5 sm:py-2 bg-primary rounded-lg self-start">
            <span className="text-xl sm:text-2xl font-medium text-primary-foreground">
              Testimonials
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
              Hear from students and advisors who use SAGE every day at Bowen
              University.
            </p>
            {isAuthenticated && (
              <Button
                size="sm"
                variant="outline"
                onClick={showForm ? cancelForm : openCreate}
                className="shrink-0 gap-1.5"
              >
                {showForm ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </>
                ) : (
                  <>
                    <PenLine className="w-3.5 h-3.5" />
                    Share your story
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Submit / Edit Form */}
        {isAuthenticated && showForm && (
          <div className="mb-10 bg-secondary border-2 border-foreground rounded-[2rem] p-6 space-y-5">
            <h3 className="font-semibold text-base">
              {editingId
                ? "Edit your testimonial"
                : "Share your SAGE experience"}
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Your title / role{" "}
                <span className="normal-case text-muted-foreground/60">
                  (optional)
                </span>
              </label>
              <input
                value={authorTitle}
                onChange={(e) => setAuthorTitle(e.target.value)}
                placeholder="e.g. Computer Science Student, 300L"
                className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Your testimonial <span className="text-destructive">*</span>
              </label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                rows={4}
                maxLength={600}
                placeholder="Share how SAGE has helped your academic journey…"
                className="w-full rounded-lg border border-foreground/20 bg-background text-sm px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground text-right">
                {quote.length}/600
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Rating
              </label>
              <StarPicker value={rating} onChange={setRating} />
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                disabled={submitting || !quote.trim()}
                onClick={submitTestimonial}
                className="gap-1.5"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {submitting
                  ? "Submitting…"
                  : editingId
                    ? "Save changes"
                    : "Submit testimonial"}
              </Button>
              <Button
                variant="outline"
                onClick={cancelForm}
                className="gap-1.5"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Testimonials are reviewed by administrators before they appear
              publicly.
            </p>
          </div>
        )}

        {/* My submissions */}
        {isAuthenticated && myTestimonials.length > 0 && (
          <div className="mb-10 space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">
              Your submissions
            </p>
            {myTestimonials.map((t) => (
              <div
                key={t._id}
                className="flex items-start justify-between gap-4 bg-secondary border border-foreground/15 rounded-2xl p-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${s <= t.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        t.isPublished
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {t.isPublished ? "✓ Published" : "Pending review"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(t)}
                    className="p-1.5 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors"
                    title="Edit"
                  >
                    <PenLine className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => void deleteTestimonial(t._id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/5 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slider */}
      <div className="w-full overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
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
                  key={testimonial._id ?? index}
                  className="bg-foreground border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:shadow-xl w-75 sm:w-95 shrink-0"
                >
                  <CardContent className="p-6 sm:p-8 flex flex-col h-full min-h-80 sm:min-h-85">
                    <div className="mb-3">
                      <StarDisplay value={testimonial.rating} />
                    </div>
                    <blockquote className="text-sm sm:text-base text-background/90 leading-relaxed flex-1 mb-6">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>
                    <div className="w-full h-px bg-background/20 mb-4" />
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="text-base sm:text-lg font-semibold text-primary-foreground">
                          {testimonial.authorName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm sm:text-base text-primary">
                          {testimonial.authorName}
                        </div>
                        <div className="text-xs sm:text-sm text-background/70 leading-tight">
                          {testimonial.authorTitle ??
                            (testimonial.authorRole === "ADVISOR"
                              ? "Academic Advisor"
                              : "Student")}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
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
