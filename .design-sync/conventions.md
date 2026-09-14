# Bodology design conventions

This library is the design language of bodology.co — a US DTC brand selling one product (Myo + D-Chiro Inositol powder). Build calm, clinical, editorial pages: cream surfaces, one blue, lots of air.

## Setup

No provider is required. Import components from `window.BodologyDS` and make sure the page uses the shipped `styles.css` (it loads the brand font **Tenon** from Adobe Fonts and defines every `--bod-*` token on `:root`). Set page backgrounds explicitly — the brand never uses pure white pages: use `var(--bod-cream)` (#fbfaf9) for shop/landing surfaces and `var(--bod-cream-warm)` (#f2eeea) for clinical/study sections.

## Styling idiom

Components carry their own styles via `bod-*` classes; style YOUR layout glue with inline styles or small CSS using the tokens — never invent colors or fonts. The vocabulary (all defined in `styles.css`):

- Inks: `--bod-blue` #1b3def (headings, accents — THE brand color), `--bod-ink` #1a2874 (body), `--bod-ink-deep`, `--bod-ink-sub`, `--bod-accent` #3447af (clinical borders/stats), `--bod-price-ink`
- Surfaces: `--bod-cream`, `--bod-cream-warm`, `--bod-cream-header`, `--bod-periwinkle` #e3e7ff (pills, popups, selected states), `--bod-periwinkle-light`
- Signals: `--bod-star-gold`, `--bod-star-off`, `--bod-sale` (sale badges ONLY — red/coral is otherwise off-brand)
- Gradients: `--bod-grad-button` (CTA), `--bod-grad-border` (trust frame), `--bod-grad-navy` (solid navy cards)
- Lines/overlay: `--bod-hairline`, `--bod-overlay` (cream lightbox overlay)
- Radii: `--bod-radius-block` 10px, `--bod-radius-card` 16px, `--bod-radius-image` 24px, `--bod-radius-pill`
- Shadows: `--bod-shadow-card`, `--bod-shadow-frame`, `--bod-shadow-pop`; Font: `--bod-font` (Tenon)

Headings are LIGHT (weight 400), large, in `--bod-blue` or `--bod-ink` — use `SectionHeading`. Never bold-heavy headlines, never uppercase buttons.

## Hard rules

- ALL popups/dialogs use `Lightbox` (or `InfoButton` for its trigger): periwinkle box, 36px/400 centered title, 18px body, underlined "Close", cream overlay. Do not design any other popup style.
- Primary CTAs use `Button` (gradient pill). One primary CTA per view; secondary actions use `variant="outline"`.
- Clinical/study layouts: `ClinicalHeader` hero, then `BigStat` + stacked `StatCard`s + `InfoButton`s, `StudyCard` for study overviews, and ALWAYS a `Footnote` with the FDA disclaimer under claim-bearing sections. Keep stat values as placeholders ("XX%") unless real approved numbers are supplied.
- Product facts that are safe to reuse: 40:1 ratio, 2 scoops = one serving (4,000mg Myo + 100mg D-Chiro), 4.8 stars, 60-day money-back guarantee, $65 one-time / $52 subscription (45-day). Do not invent other claims, dosages, or prices.

## Where the truth lives

Read `styles.css` (tokens + every component's CSS) and each component's doc under `components/<group>/<Name>/` before styling. Groups: core, product, lightbox, clinical.

## Example

```jsx
const { SectionHeading, BigStat, StatCard, InfoButton, Footnote } = window.BodologyDS;

<div style={{ background: "var(--bod-cream-warm)", padding: "64px 24px" }}>
  <SectionHeading eyebrow="Inositol: The studies" title="The Results" />
  <div style={{ maxWidth: 640, margin: "40px auto", display: "flex", flexDirection: "column", gap: 16 }}>
    <BigStat badge="Myo + D-Chiro Inositol" value="XX%" caption="of participants reported [outcome]*†" />
    <StatCard value="XX%" text="saw a positive impact on [marker]*†" />
    <InfoButton label="What is the 40:1 Ratio" popupTitle="The 40:1 Ratio" popupContent={<p>…</p>} />
  </div>
  <Footnote><p>*These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.</p></Footnote>
</div>
```
