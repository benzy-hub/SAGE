import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { initializeModels, ContactSubmission } from "@/lib/db/models";
import { sendEmail } from "@/lib/email";

type ContactType = "say-hi" | "get-quote";
type QuoteCategory =
  | "general"
  | "focus"
  | "discipline"
  | "courage"
  | "success"
  | "fresh-start"
  | "academics";

type QuotePayload = {
  text: string;
  author: string;
  source: "fallback" | "api";
};

const quoteLibrary: Record<QuoteCategory, QuotePayload[]> = {
  general: [
    {
      text: "Progress, not perfection — every small step still moves you forward.",
      author: "SAGE Daily",
      source: "fallback",
    },
    {
      text: "Your current pace is enough. Keep going, and clarity will catch up with effort.",
      author: "SAGE Daily",
      source: "fallback",
    },
    {
      text: "The future is built quietly, one consistent day at a time.",
      author: "SAGE Daily",
      source: "fallback",
    },
    {
      text: "You are allowed to begin again — with more wisdom than you had before.",
      author: "SAGE Daily",
      source: "fallback",
    },
    {
      text: "Even difficult seasons are shaping strengths you will use later.",
      author: "SAGE Daily",
      source: "fallback",
    },
    {
      text: "Keep showing up for yourself — that alone is a powerful kind of progress.",
      author: "SAGE Daily",
      source: "fallback",
    },
  ],
  focus: [
    {
      text: "Where attention goes, growth follows. Protect your focus like it matters — because it does.",
      author: "SAGE Focus",
      source: "fallback",
    },
    {
      text: "You do not need more hours; you need more intention in the hours you already have.",
      author: "SAGE Focus",
      source: "fallback",
    },
    {
      text: "One clear priority can beat a long list of scattered effort.",
      author: "SAGE Focus",
      source: "fallback",
    },
    {
      text: "A focused mind turns ordinary work into meaningful progress.",
      author: "SAGE Focus",
      source: "fallback",
    },
  ],
  discipline: [
    {
      text: "Discipline is choosing what you want most over what you want now.",
      author: "SAGE Discipline",
      source: "fallback",
    },
    {
      text: "Consistency builds results long before results become visible.",
      author: "SAGE Discipline",
      source: "fallback",
    },
    {
      text: "You can trust small daily effort more than rare bursts of motivation.",
      author: "SAGE Discipline",
      source: "fallback",
    },
    {
      text: "The habits you repeat are quietly writing your future.",
      author: "SAGE Discipline",
      source: "fallback",
    },
  ],
  courage: [
    {
      text: "Courage is not the absence of fear; it is movement in spite of it.",
      author: "SAGE Courage",
      source: "fallback",
    },
    {
      text: "The next brave step is usually more important than the perfect plan.",
      author: "SAGE Courage",
      source: "fallback",
    },
    {
      text: "You are stronger than the hesitation trying to keep you still.",
      author: "SAGE Courage",
      source: "fallback",
    },
    {
      text: "Growth often begins exactly where comfort ends.",
      author: "SAGE Courage",
      source: "fallback",
    },
  ],
  success: [
    {
      text: "Success is often quiet, cumulative, and built in moments nobody applauds.",
      author: "SAGE Success",
      source: "fallback",
    },
    {
      text: "Do the small things with excellence; big outcomes usually follow.",
      author: "SAGE Success",
      source: "fallback",
    },
    {
      text: "The version of you you are becoming is worth the effort this season demands.",
      author: "SAGE Success",
      source: "fallback",
    },
    {
      text: "Keep building. What feels ordinary today may become extraordinary in hindsight.",
      author: "SAGE Success",
      source: "fallback",
    },
  ],
  "fresh-start": [
    {
      text: "A new beginning does not erase your past; it gives your future a fresh chance.",
      author: "SAGE Fresh Start",
      source: "fallback",
    },
    {
      text: "You can restart without shame. Restarting is a form of wisdom.",
      author: "SAGE Fresh Start",
      source: "fallback",
    },
    {
      text: "Today is still enough time to choose a better direction.",
      author: "SAGE Fresh Start",
      source: "fallback",
    },
    {
      text: "Starting over is not failure — it is refusing to stay stuck.",
      author: "SAGE Fresh Start",
      source: "fallback",
    },
  ],
  academics: [
    {
      text: "Learning is rarely linear. Stay patient with yourself while mastery takes shape.",
      author: "SAGE Academics",
      source: "fallback",
    },
    {
      text: "A difficult subject is not proof that you cannot do it; it is proof that growth is happening.",
      author: "SAGE Academics",
      source: "fallback",
    },
    {
      text: "You do not need to know everything today — just enough to keep going tomorrow.",
      author: "SAGE Academics",
      source: "fallback",
    },
    {
      text: "Every page studied is a vote for the future you want.",
      author: "SAGE Academics",
      source: "fallback",
    },
  ],
};

const quoteCategories = new Set<QuoteCategory>([
  "general",
  "focus",
  "discipline",
  "courage",
  "success",
  "fresh-start",
  "academics",
]);

function getFallbackQuote(category: QuoteCategory): QuotePayload {
  const pool = quoteLibrary[category]?.length
    ? quoteLibrary[category]
    : quoteLibrary.general;
  return pool[Math.floor(Math.random() * pool.length)];
}

async function fetchOnlineQuote(
  category: QuoteCategory,
): Promise<QuotePayload | null> {
  const tagMap: Record<QuoteCategory, string[]> = {
    general: ["inspirational", "life"],
    focus: ["inspirational", "success"],
    discipline: ["success", "motivational"],
    courage: ["inspirational", "life"],
    success: ["success", "motivational"],
    "fresh-start": ["life", "inspirational"],
    academics: ["education", "success"],
  };

  const tags = tagMap[category].join(",");
  try {
    const res = await fetch(`https://zenquotes.io/api/random`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ q?: string; a?: string }>;
    const item = data?.[0];
    if (!item?.q) return null;
    return {
      text: item.q,
      author: item.a?.trim() || `ZenQuotes • ${tags}`,
      source: "api",
    };
  } catch {
    return null;
  }
}

async function buildQuote(category: QuoteCategory): Promise<QuotePayload> {
  const external = await fetchOnlineQuote(category);
  return external ?? getFallbackQuote(category);
}

function getCategoryLabel(category: QuoteCategory) {
  return {
    general: "General motivation",
    focus: "Focus",
    discipline: "Discipline",
    courage: "Courage",
    success: "Success",
    "fresh-start": "Fresh start",
    academics: "Academics",
  }[category];
}

async function sendQuoteEmail({
  to,
  name,
  category,
  note,
  quote,
}: {
  to: string;
  name: string;
  category: QuoteCategory;
  note?: string;
  quote: QuotePayload;
}) {
  const categoryLabel = getCategoryLabel(category);
  const safeName = name.replace(/[<>]/g, "");
  const safeNote = (note || "").replace(/[<>]/g, "");

  const html = `
		<!DOCTYPE html>
		<html>
			<head>
				<meta charset="utf-8" />
				<title>Your SAGE Motivation Quote</title>
				<style>
					body { font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f7fb; color: #111827; margin: 0; padding: 24px; }
					.card { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #e5e7eb; }
					.hero { background: linear-gradient(135deg, #2563eb, #0f172a); color: #ffffff; padding: 32px 28px; }
					.content { padding: 28px; }
					.pill { display: inline-block; background: #dbeafe; color: #1d4ed8; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: .02em; }
					.quote { margin: 22px 0; padding: 22px; background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 14px; font-size: 18px; line-height: 1.7; }
					.note { margin-top: 18px; padding: 16px; background: #f8fafc; border-radius: 12px; color: #475569; }
					.footer { padding: 0 28px 28px; color: #64748b; font-size: 13px; }
				</style>
			</head>
			<body>
				<div class="card">
					<div class="hero">
						<div class="pill">SAGE Motivation Delivery</div>
						<h1 style="margin: 16px 0 8px; font-size: 28px;">Hello ${safeName}, here’s your quote.</h1>
						<p style="margin: 0; color: rgba(255,255,255,.82);">Category: ${categoryLabel}</p>
					</div>
					<div class="content">
						<div class="quote">“${quote.text}”<br/><br/><strong>— ${quote.author}</strong></div>
						${safeNote ? `<div class="note"><strong>Your note:</strong><br/>${safeNote}</div>` : ""}
					</div>
					<div class="footer">
						Sent from SAGE. Keep going — small steady steps still count.
					</div>
				</div>
			</body>
		</html>
	`;

  return sendEmail({
    to,
    subject: `Your SAGE ${categoryLabel} quote`,
    html,
    text: `${quote.text} — ${quote.author}${safeNote ? `\n\nYour note: ${safeNote}` : ""}`,
  });
}

export async function POST(req: NextRequest) {
  await connectDB();
  initializeModels();

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    message?: string;
    type?: ContactType;
    quoteCategory?: QuoteCategory;
  };

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const message = String(body.message ?? "").trim();
  const type = body.type === "get-quote" ? "get-quote" : "say-hi";
  const quoteCategory = quoteCategories.has(body.quoteCategory as QuoteCategory)
    ? (body.quoteCategory as QuoteCategory)
    : "general";

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 },
    );
  }
  if (type === "say-hi" && !message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  let quote: QuotePayload | null = null;
  let emailDelivered = false;

  if (type === "get-quote") {
    quote = await buildQuote(quoteCategory);
    try {
      await sendQuoteEmail({
        to: email,
        name,
        category: quoteCategory,
        note: message,
        quote,
      });
      emailDelivered = true;
    } catch (error) {
      console.error("[Contact Quote Email] Failed to send quote email", error);
    }
  }

  const submission = await ContactSubmission.create({
    name,
    email,
    message:
      type === "get-quote" ? message || "Motivational quote request" : message,
    type,
    quoteCategory: type === "get-quote" ? quoteCategory : undefined,
    quoteText: quote?.text,
    emailDelivered,
    isRead: false,
  });

  return NextResponse.json(
    {
      ok: true,
      id: submission._id,
      quote: quote?.text,
      author: quote?.author,
      category: type === "get-quote" ? quoteCategory : undefined,
      emailDelivered,
      supportVisible: true,
    },
    { status: 201 },
  );
}
