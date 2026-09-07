import React from "react";

export interface PriceProps {
  /** Current price, already formatted (e.g. "$34.99"). */
  price: string;
  /** Struck-through compare-at price when on sale. */
  compareAt?: string;
  /** Unit price line, e.g. "$1.17 / serving". */
  unit?: string;
  /** Sale badge text, e.g. "Save 20%". Rendered in the theme's sale red. */
  badge?: string;
  className?: string;
}

/**
 * Product price display: compare-at strikethrough, current amount, optional
 * unit price and sale badge — the theme's product-price pattern.
 */
export function Price({ price, compareAt, unit, badge, className }: PriceProps) {
  const cls = ["bod-price", className].filter(Boolean).join(" ");
  return (
    <span className={cls}>
      {compareAt && (
        <del>
          <span>{compareAt}</span>
        </del>
      )}
      <ins>
        <span>{price}</span>
      </ins>
      {unit && <small className="bod-price__unit">{unit}</small>}
      {badge && <span className="bod-price__badge">{badge}</span>}
    </span>
  );
}
