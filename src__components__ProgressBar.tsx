"use client";

export default function ProgressBar({ active, position = "top" }: { active: boolean; position?: "top" | "inline" }) {
  if (!active) return null;
  if (position === "inline") {
    return (
      <div className="progress-inline" aria-hidden="true">
        <div className="progress-inline-bar" />
      </div>
    );
  }
  return (
    <div className="progress-top" role="status" aria-label="Loading">
      <div className="progress-top-bar" />
    </div>
  );
}
