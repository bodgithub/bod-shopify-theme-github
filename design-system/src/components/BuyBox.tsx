import React from "react";
import { Button } from "./Button";
import { Price } from "./Price";
import { StarRating } from "./StarRating";

export interface BuyBoxPlan {
  /** Plan name, e.g. "Subscribe & Save". */
  name: string;
  /** Formatted price for this plan. */
  price: string;
  /** Small note under the name, e.g. "Delivered monthly. Cancel anytime." */
  note?: string;
  /** Pill badge next to the name, e.g. "Save 20%". */
  badge?: string;
}

export interface BuyBoxProps {
  /** Product title shown at the top of the box. */
  title: string;
  /** Star rating (0–5); omit to hide the stars row. */
  rating?: number;
  /** Selling plans; the plan at selectedIndex renders selected. */
  plans: BuyBoxPlan[];
  selectedIndex?: number;
  /** Called with the index of the clicked plan. */
  onSelectPlan?: (index: number) => void;
  /** CTA label (default "Add to Cart"). */
  ctaLabel?: string;
  onAddToCart?: () => void;
  /** Reassurance line under the CTA, e.g. "60-Day Happiness Guarantee". */
  note?: string;
  className?: string;
}

/**
 * Product buy box: title, stars, selling-plan selector (subscription vs
 * one-time), gradient add-to-cart button, and a reassurance note — the
 * pattern of the theme's product purchase area.
 */
export function BuyBox({
  title,
  rating,
  plans,
  selectedIndex = 0,
  onSelectPlan,
  ctaLabel = "Add to Cart",
  onAddToCart,
  note,
  className,
}: BuyBoxProps) {
  const [selected, setSelected] = React.useState(selectedIndex);
  React.useEffect(() => setSelected(selectedIndex), [selectedIndex]);
  const cls = ["bod-buy", className].filter(Boolean).join(" ");
  return (
    <div className={cls}>
      <h3 className="bod-buy__title">{title}</h3>
      {rating !== undefined && (
        <div className="bod-buy__row">
          <StarRating rating={rating} />
        </div>
      )}
      <div className="bod-buy__plans" role="radiogroup" aria-label="Purchase options">
        {plans.map((p, i) => {
          const isSel = i === selected;
          return (
            <div
              key={i}
              role="radio"
              aria-checked={isSel}
              tabIndex={0}
              className={
                "bod-buy__plan" + (isSel ? " bod-buy__plan--selected" : "")
              }
              onClick={() => {
                setSelected(i);
                onSelectPlan?.(i);
              }}
            >
              <span className="bod-buy__radio" aria-hidden="true" />
              <span className="bod-buy__plan-main">
                <span className="bod-buy__plan-name">
                  {p.name}
                  {p.badge && <span className="bod-buy__save">{p.badge}</span>}
                </span>
                {p.note && <span className="bod-buy__plan-note">{p.note}</span>}
              </span>
              <Price price={p.price} className="bod-buy__plan-price" />
            </div>
          );
        })}
      </div>
      <Button fullWidth className="bod-buy__cta" onClick={onAddToCart}>
        {ctaLabel}
      </Button>
      {note && <p className="bod-buy__note">{note}</p>}
    </div>
  );
}
