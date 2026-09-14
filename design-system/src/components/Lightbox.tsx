import React from "react";

export interface LightboxProps {
  /** Whether the lightbox is shown. */
  open: boolean;
  /** Centered title (36px, weight 400). */
  title: React.ReactNode;
  /** Body content (18px, centered). */
  children: React.ReactNode;
  /** Called on Close click, overlay click, or Escape. */
  onClose?: () => void;
  /** Close link label (default "Close"). */
  closeLabel?: string;
  className?: string;
}

/**
 * Bodology clinical lightbox — the standard popup style: periwinkle
 * (#e3e7ff) box with accent border, centered light-weight title, 18px body,
 * underlined Close link, over a translucent cream overlay.
 */
export function Lightbox({
  open,
  title,
  children,
  onClose,
  closeLabel = "Close",
  className,
}: LightboxProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const cls = ["bod-lb", className].filter(Boolean).join(" ");
  return (
    <>
      <div className="bod-lb__overlay" onClick={onClose} />
      <div className={cls} role="dialog" aria-modal="true">
        <h2 className="bod-lb__title">{title}</h2>
        <div className="bod-lb__body">{children}</div>
        <p className="bod-lb__close-wrap">
          <button type="button" className="bod-lb__close" onClick={onClose}>
            {closeLabel}
          </button>
        </p>
      </div>
    </>
  );
}
