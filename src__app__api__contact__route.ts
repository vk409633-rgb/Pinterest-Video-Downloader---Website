import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import nodemailer from "nodemailer";
import { createRateLimiter } from "@/lib/rate-limit";

const limiter = createRateLimiter({ intervalMs: 10 * 60_000, uniqueTokenPerInterval: 5 }); // 5 per 10 min/IP

const ContactSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().max(120),
  message: z.string().min(10).max(2000),
  website: z.string().max(0).optional(), // honeypot must be empty
  ts: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const token = limiter.take(`contact:${ip}`);
  if (!token.ok) {
    return new NextResponse("Too many requests. Please try later.", { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }
  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) return new NextResponse("Invalid payload", { status: 400 });

  // Honeypot: if present or non-empty, pretend success
  if (typeof (parsed.data.website as any) === "string" && (parsed.data.website as string).length > 0) {
    return NextResponse.json({ ok: true });
  }

  // Simple time check: require 3s since form render (best-effort)
  if (parsed.data.ts && Date.now() - parsed.data.ts < 3000) {
    return new NextResponse("Submission too fast.", { status: 400 });
  }

  const to = process.env.CONTACT_TO || "vk409633@gmail.com";
  const from = process.env.CONTACT_FROM || "no-reply@localhost";

  // If SMTP not configured, return OK with a notice
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env as Record<string, string | undefined>;
  if (!SMTP_HOST || !SMTP_PORT) {
    console.warn("Contact form received but SMTP not configured. Set SMTP_HOST/SMTP_PORT to enable email sending.");
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });

    const { name, email, message } = parsed.data;
    const info = await transporter.sendMail({
      from,
      to,
      subject: "New contact form message - Pinterest Video Downloader",
      replyTo: email,
      text: `From: ${name} <${email}>
IP: ${ip}
\n${message}`,
    });

    return NextResponse.json({ ok: true, delivered: true, id: info.messageId });
  } catch (err: any) {
    console.error("Failed to send contact email", err);
    return new NextResponse("Failed to send message", { status: 500 });
  }
}
