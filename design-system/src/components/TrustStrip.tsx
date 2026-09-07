import React from "react";

export type TrustIcon =
  | "leaf"
  | "flask"
  | "shield"
  | "star"
  | "capsule"
  | "drop"
  | "usa"
  | "heart";

export interface TrustStripItem {
  icon: TrustIcon;
  /** Bold item title, e.g. "3rd-Party Tested". */
  title: string;
  /** Small uppercase sub-label, e.g. "EVERY BATCH". */
  sub?: string;
}

export interface TrustStripProps {
  /** Optional headline in the card's header row. */
  headline?: string;
  /** 4 or 8 items — the grid lays out 4 per row (2 per row when columns=2). */
  items: TrustStripItem[];
  /**
   * gradient-frame (default) — white card inside the blue gradient border frame.
   * solid — navy radial-gradient card with white icons/text.
   */
  variant?: "gradient-frame" | "solid";
  /** Grid columns per row (4 default; 2 for narrow placements). */
  columns?: 2 | 4;
  className?: string;
}

const ICONS: Record<TrustIcon, React.ReactNode> = {
  leaf: (
    <path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14Zm0 0c3-5 7-9 11-11" />
  ),
  flask: (
    <path d="M10 3h4M11 3v5.5L5.8 18a2 2 0 0 0 1.8 3h8.8a2 2 0 0 0 1.8-3L13 8.5V3M8 15h8" />
  ),
  shield: (
    <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3Zm-3 9l2 2 4-4" />
  ),
  star: (
    <path d="M12 3.5l2.5 5.2 5.7.7-4.2 3.9 1.1 5.6-5.1-2.8-5.1 2.8 1.1-5.6L3.8 9.4l5.7-.7L12 3.5Z" />
  ),
  capsule: (
    <path d="M8.5 3.5a5 5 0 0 1 7 7l-5 5a5 5 0 0 1-7-7l5-5Zm-2.2 2.3l7 7" />
  ),
  drop: (
    <path d="M12 3.5S6 10 6 14.5a6 6 0 0 0 12 0C18 10 12 3.5 12 3.5Z" />
  ),
  usa: (
    <path d="M4 5h16v14H4V5Zm0 4h16M4 12h16M4 15.5h16M4 5v14" />
  ),
  heart: (
    <path d="M12 20s-7-4.5-8.5-9A4.6 4.6 0 0 1 12 7.4 4.6 4.6 0 0 1 20.5 11C19 15.5 12 20 12 20Z" />
  ),
};

/**
 * Bodology trust strip: the gradient-framed white card with a grid of
 * icon + title + sub-label cells, used in the product buy area and on
 * landing pages. Solid variant renders the navy gradient card.
 */
export function TrustStrip({
  headline,
  items,
  variant = "gradient-frame",
  columns = 4,
  className,
}: TrustStripProps) {
  const cls = [
    "bod-ts",
    variant === "solid" && "bod-ts--solid",
    columns === 2 && "bod-ts--cols-2",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls}>
      <div className="bod-ts__frame">
        <div className="bod-ts__card">
          {headline && (
            <div className="bod-ts__head">
              <h3 className="bod-ts__title">{headline}</h3>
            </div>
          )}
          <div className="bod-ts__grid">
            {items.map((it, i) => (
              <div className="bod-ts__cell" key={i}>
                <svg className="bod-ts__ic" viewBox="0 0 24 24" aria-hidden="true">
                  {ICONS[it.icon]}
                </svg>
                <span className="bod-ts__txt">
                  <span className="bod-ts__t">{it.title}</span>
                  {it.sub && <span className="bod-ts__s">{it.sub}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
