# Bodology Shopify Theme

Custom Shopify theme for Bodology, a US DTC brand selling a single hero product:
Myo + D-Chiro Inositol powder. This repo is for building/editing the theme and writing on-page copy.

## Working rules (do not deviate)
- Only ever work on the `dev` branch. Never edit or commit to `main` — it is the live store.
- Show me a diff before changing any existing file.
- Never invent product facts, dosages, ratios, or prices. Use only `/brand/product-facts.md`.
  If a fact isn't in that file, stop and ask — do not guess.
- Do not merge updates from the original vendor base theme.
- When I may be editing in the Shopify theme editor, run the dev server with `--theme-editor-sync`.

## Read these before writing or building (in this order)
- `/brand/brand-voice.md` — how Bodology sounds. Read before writing ANY copy.
- `/brand/product-facts.md` — the only source of truth for product claims, dose, ratio, price.
- `/brand/compliance.md` — allowed vs. banned health claims. Every external line must pass this.
- `/brand/ad-strategy.md` — READ THIS before building any landing page or paid-traffic page.

## When writing page copy
- Check the page's story arc end to end:
  hook → the problem they feel → why this → proof/credibility → what it is → how to start.
  If a section is missing or out of order, flag it before writing.
- ALWAYS give me multiple options for headlines and any key section (hero, subhead, CTA, proof block).
  Never hand me a single draft.
- Flag any line that's borderline on compliance for my review instead of shipping it.