import React from "react";
import { Pill } from "./Pill";

export interface BigStatProps {
  /** The giant stat, e.g. "62%". */
  value: string;
  /** Caption under the number, e.g. "of participants reported ... after 12 weeks*†". */
  caption?: React.ReactNode;
  /** Uppercase badge above the number, e.g. "MYO + D-CHIRO INOSITOL". */
  badge?: string;
  className?: string;
}

/**
 * Giant clinical stat: uppercase badge, 92px accent number, and caption —
 * the lead element of the "The Results" clinical block.
 */
export function BigStat({ value, caption, badge, className }: BigStatProps) {
  const cls = ["bod-bigstat", className].filter(Boolean).join(" ");
  return (
    <div className={cls}>
      {badge && <Pill variant="badge">{badge}</Pill>}
      <p className="bod-bigstat__num">{value}</p>
      {caption && <p className="bod-bigstat__caption">{caption}</p>}
    </div>
  );
}
