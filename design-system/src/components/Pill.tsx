import React from "react";

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * eyebrow — rounded periwinkle pill used above headings ("Inositol: The studies").
   * badge — square-cornered uppercase bordered label ("MYO + D-CHIRO INOSITOL").
   */
  variant?: "eyebrow" | "badge";
}

/**
 * Small label pill. Eyebrow pills sit above section headings; badge pills
 * label clinical stats and product attributes in uppercase.
 */
export function Pill({
  variant = "eyebrow",
  className,
  children,
  ...rest
}: PillProps) {
  const cls = [
    "bod-pill",
    variant === "badge" && "bod-pill--badge",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  );
}
