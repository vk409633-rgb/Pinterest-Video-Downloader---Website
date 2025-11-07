import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = "Best Pinterest Video Downloader";
const brandNick = process.env.NEXT_PUBLIC_BRAND_NICK || "Website";
const combinedName = `${siteName} - ${brandNick}`;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${combinedName} | Fast & Free Downloader`,
    template: `%s | ${combinedName}`,
  },
  description:
    "Download Pinterest videos in HD for free. Paste a Pin URL and get direct MP4 links instantly. No signup, no ads clutter.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: combinedName,
    description:
      "Download Pinterest videos in HD for free. Paste a Pin URL and get direct MP4 links instantly.",
    url: siteUrl,
    siteName: combinedName,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: combinedName,
    description:
      "Download Pinterest videos in HD for free. Paste a Pin URL and get direct MP4 links instantly.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://i.pinimg.com" crossOrigin="" />
        <link rel="dns-prefetch" href="//i.pinimg.com" />
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <>
            <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
            <link rel="dns-prefetch" href="//www.googletagmanager.com" />
            <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="" />
            <link rel="dns-prefetch" href="//www.google-analytics.com" />
          </>
        ) : null}
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? (
          <>
            <link rel="preconnect" href="https://plausible.io" crossOrigin="" />
            <link rel="dns-prefetch" href="//plausible.io" />
          </>
        ) : null}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT ? (
          <>
            <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="" />
            <link rel="dns-prefetch" href="//pagead2.googlesyndication.com" />
          </>
        ) : null}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Script id="jsonld-website" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: combinedName,
            url: siteUrl,
            potentialAction: {
              "@type": "SearchAction",
              target: `${siteUrl}/?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          })}
        </Script>
        <nav className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-6 text-sm">
          <Link href="/" className="nav-link font-semibold">Home</Link>
          <Link href="/sponsored" className="nav-link">Sponsored</Link>
          <Link href="/faq" className="nav-link">FAQ</Link>
          <Link href="/contact" className="nav-link">Contact</Link>
        </nav>
        {children}
        {/* Google Analytics (optional via env) */}
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}');
              `}
            </Script>
          </>
        ) : null}
        {/* Plausible (optional via env) */}
        {plausibleDomain ? (
          <Script
            strategy="lazyOnload"
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
          />
        ) : null}
        {/* Google AdSense (optional via env). Note: requires site verification/approval. */}
        {adsenseClient ? (
          <>
            <Script
              id="adsbygoogle-init"
              strategy="afterInteractive"
              crossOrigin="anonymous"
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            />
            {/* Pinterest Ad Unit */}
            <ins
              className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client={adsenseClient}
              data-ad-slot="1452648669"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
            <Script id="adsbygoogle-push" strategy="afterInteractive">
              {`
                (adsbygoogle = window.adsbygoogle || []).push({});
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
