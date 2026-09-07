import React from "react";
import { Pill } from "./Pill";

export interface ClinicalAnchorLink {
  label: string;
  /** Anchor target, without the leading '#'. */
  anchor: string;
}

export interface ClinicalHeaderProps {
  /** Big heading; use "\n" for kept line breaks ("Bodology:\nThe Studies"). */
  heading: string;
  /** Eyebrow pill above the heading, e.g. "Inositol: The studies". */
  eyebrow?: string;
  /** Supporting sentence under the heading. */
  subtext?: React.ReactNode;
  /** Anchor-link rows with top borders and arrow icons. */
  links?: ClinicalAnchorLink[];
  className?: string;
}

/**
 * Clinical study page header: warm cream background, eyebrow pill, large
 * blue heading, subtext, and a bordered anchor-link list with right arrows.
 */
export function ClinicalHeader({
  heading,
  eyebrow,
  subtext,
  links,
  className,
}: ClinicalHeaderProps) {
  const cls = ["bod-ch", className].filter(Boolean).join(" ");
  return (
    <div className={cls}>
      <div className="bod-ch__content">
        {eyebrow && (
          <p className="bod-ch__pill">
            <Pill>{eyebrow}</Pill>
          </p>
        )}
        <h1 className="bod-ch__heading">{heading}</h1>
        {subtext && <p className="bod-ch__sub">{subtext}</p>}
        {links && links.length > 0 && (
          <ul className="bod-ch__links">
            {links.map((l, i) => (
              <li className="bod-ch__link-item" key={i}>
                <a href={`#${l.anchor}`} className="bod-ch__link">
                  {l.label}
                </a>
                <span className="bod-ch__arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4 12h15m0 0-6-6m6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
