import React from "react";

export interface FootnoteProps {
  /** One or more small-print lines (†/‡ study footnotes, FDA disclaimer). */
  children: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}

/**
 * Clinical footnote strip: small print on the warm cream background, used
 * under study sections for †/‡ footnotes and the FDA disclaimer.
 */
export function Footnote({ children, align = "center", className }: FootnoteProps) {
  const cls = [
    "bod-footnote",
    align === "left" && "bod-footnote--left",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <div className={cls}>{children}</div>;
}
