"use client";
import { useEffect } from "react";

type Props = {
  slot: string;
  format?: string; // e.g., "auto"
  layout?: "in-article" | "fluid" | "responsive";
  className?: string;
};

export default function AdSlot({ slot, format = "auto", layout = "responsive", className }: Props) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [slot]);

  if (!client) return null;

  return (
    <ins
      className={`adsbygoogle block ${className || ""}`}
      style={{ display: "block" }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
