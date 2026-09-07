import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * primary — blue gradient pill, the main CTA / add-to-cart button.
   * outline — periwinkle pill with accent border (secondary / informational actions).
   * white — white pill for use on dark or gradient backgrounds.
   */
  variant?: "primary" | "outline" | "white";
  /** default = 50px CTA height; medium = 40px; small = 32px. */
  size?: "default" | "medium" | "small";
  /** Stretch to the container width (mobile add-to-cart pattern). */
  fullWidth?: boolean;
}

/**
 * Bodology pill button. The primary variant is the theme's gradient CTA
 * (linear-gradient 105deg #0f2ed0 → #0a95ef) with a springy scale on hover.
 */
export function Button({
  variant = "primary",
  size = "default",
  fullWidth,
  className,
  children,
  ...rest
}: ButtonProps) {
  const cls = [
    "bod-btn",
    variant !== "primary" && `bod-btn--${variant}`,
    size !== "default" && `bod-btn--${size}`,
    fullWidth && "bod-btn--full",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button type="button" className={cls} {...rest}>
      <span>{children}</span>
    </button>
  );
}
