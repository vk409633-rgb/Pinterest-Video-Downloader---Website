import type { Metadata } from "next";

const faqs = [
  {
    q: "Is this downloader free?",
    a: "Yes. It’s free and requires no signup.",
  },
  {
    q: "Do you store my links?",
    a: "No. Extraction happens server-side and isn’t persisted.",
  },
  {
    q: "Is this legal?",
    a: "Use downloads only for personal use and respect creators’ rights and platform Terms.",
  },
];

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about the Pinterest Video Downloader.",
};

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold">FAQ</h1>
      <div className="mt-6 space-y-6">
        {faqs.map((f) => (
          <div key={f.q}>
            <h2 className="text-lg font-semibold">{f.q}</h2>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">{f.a}</p>
          </div>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
