import React from "react";

export interface StarRatingProps {
  /** Rating from 0 to 5; partial fills render (e.g. 4.8). */
  rating: number;
  /** Show the "X.X Stars (Read Reviews)" label. */
  showLabel?: boolean;
  /** Star size in px (theme default 19). */
  size?: number;
  /** Filled star color (theme default gold #FFCD53). */
  colorOn?: string;
  /** Empty star color. */
  colorOff?: string;
  className?: string;
}

const STAR_PATH =
  "M10.94 0 L14.32 6.85 L21.87 7.95 L16.41 13.28 L17.7 20.8 L10.94 17.25 L4.18 20.8 L5.47 13.28 L0 7.95 L7.56 6.85 Z";
const STAR_W = 21.87;
const GAP = 2.4;

/**
 * Bodology star rating (the "bod-stars" pattern): five chunky SVG stars with
 * exact partial fill and an optional "4.8 Stars (Read Reviews)" label.
 */
export function StarRating({
  rating,
  showLabel = true,
  size = 19,
  colorOn = "#FFCD53",
  colorOff = "#E1E1E1",
  className,
}: StarRatingProps) {
  const r = Math.max(0, Math.min(5, Math.round(rating * 10) / 10));
  const pitch = STAR_W + GAP * (STAR_W / size);
  const vbW = pitch * 4 + STAR_W;
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const cls = ["bod-stars", className].filter(Boolean).join(" ");
  return (
    <span
      className={cls}
      role="img"
      aria-label={`Rated ${r} out of 5 stars`}
    >
      <svg
        className="bod-stars__svg"
        style={{ height: size }}
        viewBox={`0 0 ${vbW} 20.8`}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <path id={`bod-star-${uid}`} d={STAR_PATH} />
          <linearGradient id={`bod-grad-${uid}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset={`${((r % 1) * 100).toFixed(0)}%`} stopColor={colorOn} />
            <stop offset={`${((r % 1) * 100).toFixed(0)}%`} stopColor={colorOff} />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, r - i));
          const x = i * pitch;
          const color =
            fill >= 1 ? colorOn : fill <= 0 ? colorOff : `url(#bod-grad-${uid})`;
          return <use key={i} href={`#bod-star-${uid}`} x={x} fill={color} />;
        })}
      </svg>
      {showLabel && (
        <span className="bod-stars__label">
          {r} Stars <span className="bod-stars__cta">(Read Reviews)</span>
        </span>
      )}
    </span>
  );
}
