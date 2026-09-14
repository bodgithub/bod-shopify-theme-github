import React from "react";
import { Pill } from "./Pill";

export interface SectionHeadingProps {
  /** Main heading text (48px, weight 400). */
  title: React.ReactNode;
  /** Optional eyebrow pill rendered above the title. */
  eyebrow?: React.ReactNode;
  /** Optional supporting sentence below the title. */
  subtitle?: React.ReactNode;
  /** Heading color: brand blue (default) or body-navy ink. */
  tone?: "blue" | "ink";
  align?: "center" | "left";
  /** Heading level for the rendered element (h2 by default). */
  as?: "h1" | "h2" | "h3";
  className?: string;
}

/**
 * Section heading in the theme's style: light-weight large title in brand
 * blue (or navy ink), with optional eyebrow pill and subtitle.
 */
export function SectionHeading({
  title,
  eyebrow,
  subtitle,
  tone = "blue",
  align = "center",
  as = "h2",
  className,
}: SectionHeadingProps) {
  const Tag = as;
  const cls = [
    "bod-sh",
    tone === "ink" && "bod-sh--ink",
    align === "left" && "bod-sh--left",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls}>
      {eyebrow && (
        <div className="bod-sh__eyebrow">
          <Pill>{eyebrow}</Pill>
        </div>
      )}
      <Tag className="bod-sh__title">{title}</Tag>
      {subtitle && <p className="bod-sh__sub">{subtitle}</p>}
    </div>
  );
}
