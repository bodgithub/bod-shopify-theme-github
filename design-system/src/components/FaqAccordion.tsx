import React from "react";

export interface FaqItem {
  question: string;
  answer: React.ReactNode;
  /** Render this item expanded. */
  open?: boolean;
}

export interface FaqAccordionProps {
  items: FaqItem[];
  className?: string;
}

/**
 * Collapsible FAQ list in the theme's style: hairline dividers, navy text,
 * and a circled plus that rotates when an item is open.
 */
export function FaqAccordion({ items, className }: FaqAccordionProps) {
  const cls = ["bod-faq", className].filter(Boolean).join(" ");
  return (
    <div className={cls}>
      {items.map((it, i) => (
        <details className="bod-faq__item" key={i} open={it.open}>
          <summary className="bod-faq__q">
            {it.question}
            <span className="bod-faq__plus" aria-hidden="true">
              +
            </span>
          </summary>
          <div className="bod-faq__a">{it.answer}</div>
        </details>
      ))}
    </div>
  );
}
