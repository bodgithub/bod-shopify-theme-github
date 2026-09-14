# design-sync notes — Bodology

- The design system is NOT a pre-existing package: it lives in `design-system/` inside the Shopify theme repo, authored (Sept 2026) from the theme's own design language (config/settings_data.json, assets/app.css, sections/clinical-*.liquid, snippets/trust-strip.liquid, snippets/bod-stars.liquid). Keep it in sync with the theme by re-extracting values when the theme's design changes.
- Build: `cd design-system && npm run build` (tsc). Converter flags: `--node-modules design-system/node_modules --entry design-system/dist/index.js`.
- No playwright browsers installed on this machine. Render checks run against system Chrome: prefix validate/capture/resync with `DS_CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`.
- Tokens are inlined at the top of `design-system/src/styles.css` (single `:root` block). Do NOT split them into a separate file — the converter's `tokens/` copy path only works from a separate npm package (`tokensPkg`), and a relative `@import "./tokens.css"` breaks the bundle closure ([CSS_IMPORT_MISSING]).
- Brand font Tenon loads via a remote Adobe Fonts `@import` (use.typekit.net/sjq1yng.css). `runtimeFontPrefixes: ["tenon"]` suppresses [FONT_MISSING]; a [FONT_REMOTE] info line is expected and fine.
- `Lightbox` renders position:fixed, so its preview wraps it in a fixed-height (500px) container and uses `cardMode: single`; without the wrapper the card clips the popup.
- Known render warns: none.

## Re-sync risks

- Prices ($65/$52), 4.8 rating, and guarantee copy in previews come from `brand/product-facts.md` (pricing confirmed Aug 2026, "recheck monthly"). When facts change, update the preview `.tsx` files and `conventions.md` together.
- Clinical stat values are deliberate placeholders ("XX%", "[marker]") per the no-invented-facts rule — do not "fix" them with real-looking numbers.
- First upload has NOT happened yet as of writing — no `projectId` pinned. The next run with design authorization should create the project and take the incremental path.
