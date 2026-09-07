import React from "react";

export interface StatCardProps {
  /** The stat value, e.g. "70%". */
  value: string;
  /** Supporting text, e.g. "saw a positive impact on ovarian function*†". */
  text: React.ReactNode;
  className?: string;
}

/**
 * Clinical stat card: rounded bordered card with a large accent number
 * beside supporting text, used in rows under the BigStat.
 */
export function StatCard({ value, text, className }: StatCardProps) {
  const cls = ["bod-statcard", className].filter(Boolean).join(" ");
  return (
    <div className={cls}>
      <div className="bod-statcard__inner">
        <span className="bod-statcard__num">{value}</span>
        <p className="bod-statcard__text">{text}</p>
      </div>
    </div>
  );
}
