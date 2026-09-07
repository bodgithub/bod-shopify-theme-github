import React from "react";
import { Lightbox } from "./Lightbox";

export interface InfoButtonProps {
  /** Button label, e.g. "What are HOMA-IR Levels". */
  label: string;
  /** Title of the lightbox this button opens. */
  popupTitle?: React.ReactNode;
  /** Lightbox body content. */
  popupContent?: React.ReactNode;
  /** Called on click (in addition to opening the popup when content is set). */
  onClick?: () => void;
  className?: string;
}

/**
 * Info pill button with a circled "+", as used under clinical stat cards
 * ("What are HOMA-IR Levels +"). When popupTitle/popupContent are provided
 * it opens the standard clinical Lightbox.
 */
export function InfoButton({
  label,
  popupTitle,
  popupContent,
  onClick,
  className,
}: InfoButtonProps) {
  const [open, setOpen] = React.useState(false);
  const cls = ["bod-info-btn", className].filter(Boolean).join(" ");
  return (
    <>
      <button
        type="button"
        className={cls}
        onClick={() => {
          if (popupContent) setOpen(true);
          onClick?.();
        }}
      >
        {label}
        <span className="bod-info-btn__plus" aria-hidden="true">
          +
        </span>
      </button>
      {popupContent && (
        <Lightbox
          open={open}
          title={popupTitle ?? label}
          onClose={() => setOpen(false)}
        >
          {popupContent}
        </Lightbox>
      )}
    </>
  );
}
