import React from "react";

export interface StudyCardProps {
  /** Title bar text, e.g. "Study 1 · PCOS & Ovarian Function". */
  title: string;
  /** Subtitle inside the body, e.g. "Study background". */
  subtitle?: string;
  /** Study background / description text. */
  children: React.ReactNode;
  /** Attribute chips, e.g. ["Randomized", "Double-blind", "Placebo-controlled", "n=120"]. */
  chips?: string[];
  className?: string;
}

/**
 * Study overview card: bordered rounded card with a periwinkle title bar,
 * study background text, accent divider, and attribute chips — the theme's
 * study-overview-table pattern.
 */
export function StudyCard({
  title,
  subtitle,
  children,
  chips,
  className,
}: StudyCardProps) {
  const cls = ["bod-study", className].filter(Boolean).join(" ");
  return (
    <div className={cls}>
      <div className="bod-study__titlebar">{title}</div>
      <div className="bod-study__body">
        {subtitle && <h4 className="bod-study__subtitle">{subtitle}</h4>}
        <div className="bod-study__text">{children}</div>
        {chips && chips.length > 0 && (
          <>
            <hr className="bod-study__divider" />
            <div className="bod-study__chips">
              {chips.map((c, i) => (
                <span className="bod-study__chip" key={i}>
                  {c}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
