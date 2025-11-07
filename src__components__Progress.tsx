"use client";
import React from "react";

export default function Progress({ active, label, inline = true }: { active: boolean; label?: string; inline?: boolean }) {
  if (!active) return null;
  if (inline) {
    return (
      <div className="progress-container" role="status" aria-label={label || "Loading"}>
        <div className="progress-bar" />
      </div>
    );
  }
  return (
    <div className="progress-top-wrapper" role="status" aria-label={label || "Loading"}>
      <div className="progress-top-bar" />
    </div>
  );
}
