# bod-shopify-theme-github

Bodology's Shopify theme. `main` is the live store. All work happens on `dev`.

## Cart drawer: how to edit it

The slide-out cart is custom theme code, not an app. It lives in:

| File | What it does |
|---|---|
| `snippets/cart-drawer.liquid` | Emits the cart data + your settings as JSON. No layout here. |
| `assets/cart-drawer.js` | Builds the cart state and renders design A, B or C. |
| `assets/cart-drawer.css` | The three skins. Colours come from theme settings. |
| `config/settings_schema.json` | The "Cart drawer (Bodology)" settings group. |

Every price and percentage in the drawer is read from the live cart. Nothing is hardcoded, so you can change a discount code, a selling plan or a price in Shopify admin and the drawer follows.

### Switching designs

Online Store → Customize → Theme settings → **Cart drawer (Bodology)** → **Cart design**.

- **A** code-applied banner, **B** savings hero, **C** receipt breakdown.
- **Random split** gives each visitor one design at random (33/33/33), remembers it in their browser, and writes it to the order as the cart attribute `_cart_design` so you can compare conversion per design in Orders.

To preview a design in your own browser without changing the setting, add `?cart_design=a` (or `b`, `c`) to any page URL. It sticks for that browser until you visit a page with `?cart_design=reset`.

### Theme settings (Customize → Theme settings → Cart drawer (Bodology))

Every piece of customer-facing text is a setting. Tokens in curly braces are replaced at render time and each field's help text lists the tokens it accepts. The main ones:

| Setting | Tokens | Notes |
|---|---|---|
| Applied-code banner text | `{code}` `{percent}` | `{percent}` is the TOTAL first-order % on the subscription lines (or the one-off lines if there are no subscriptions). Never the code's raw %. |
| Mixed-cart banner text | `{code}` | Used when lines end up with different effective %s. |
| Subscription line subtitle | `{interval}` `{plan}` | Default "Ships every {interval} · cancel anytime". |
| Renewal line | `{interval}` `{renewal_price}` `{plan}` | Shown under every subscription line. `{renewal_price}` is the plan's normal subscribe & save price × quantity, with no code. |
| Plan intervals | — | One per line: `selling plan ID: wording`. Defaults cover the three live plans ("4 weeks", "6 weeks", "3 months"). An unlisted plan falls back to its own name. |
| Discount badge text | `{percent}` | The line's true effective %. Hidden when it would read 0%. |
| Protocol product / display value / variant to add | — | Every variant of the picked product counts as the protocol. The value is what's struck through next to FREE and counted in savings. |
| Upsell row text | `{target}` `{percent}` `{protocol_text}` | `{percent}` is the target plan's subscribe & save % for that variant. |
| Upsell targets (fallback) | — | One per line: `one-off variant ID: selling plan ID`. The variant metafield below overrides it. |
| Savings strip text | `{amount}` | List prices (including the protocol's display value when it's free) minus total today. |
| Checkout button text | `{total}` | Design B always shows its left text and the total on the right. |
| Free shipping texts | `{amount}` | The threshold is "Free shipping minimum amount" in the vendor "Cart Drawer" group. |
| Code field | — | Always open / collapsed behind a link once a code is applied / hidden. |
| Colours | — | Primary, navy, savings green, savings background, text, muted. |

### Product and variant metafields (Settings → Custom data)

Create these definitions once. All are in the `bodology` namespace. Tick **Pin** on each so they show on the product/variant admin page.

**Products** (Settings → Custom data → Products → Add definition):

| Name | Namespace and key | Type | What it does |
|---|---|---|---|
| Cart display name | `bodology.cart_display_name` | Single line text | Short name shown in the drawer instead of the product title (e.g. "Inositol powder", "Protocol"). |
| Qualifies for protocol | `bodology.qualifies_for_protocol` | True or false | Leave unset or true. Set false on a subscription product that should NOT unlock the free protocol. |
| Hide discount badge | `bodology.hide_discount_badge` | True or false | Hides the % badge on this product's lines. |

**Variants** (Settings → Custom data → Variants → Add definition):

| Name | Namespace and key | Type | What it does |
|---|---|---|---|
| Upsell selling plan ID | `bodology.upsell_selling_plan_id` | Single line text | The selling plan a one-off line is offered as a swap to. Overrides the theme-setting fallback map. |
| Upsell target variant | `bodology.upsell_target_variant` | Variant reference | Optional. Only needed if the swap should move to a different variant. |

Values to enter today (Products → Myo + D-Chiro Inositol Powder → Variants):

| Variant | Variant ID | `bodology.upsell_selling_plan_id` | Result |
|---|---|---|---|
| 4-week supply (one-off, $45) | 46444657279195 | `6331924699` | Switch to 1-Month Plan (12% off, renews every 4 weeks) |
| 6-week supply (one-off, $65) | 46444646269147 | `5755961563` | Switch to 6-Week Plan (15% off, renews every 6 weeks) |

Leave `upsell_target_variant` empty for both: the swap stays on the same variant. The drawer works with the theme-setting fallback until the metafields exist, so this is not blocking.

### How the effective % is calculated

Per line, Shopify's own numbers are used, so the drawer matches checkout to the cent:

```
line price after everything = original_line_price − total_discount     (from /cart.js)
list price                  = variant price × quantity
effective %                 = round( 1 − line price after everything ÷ list price )
```

`original_line_price` already includes the selling plan's subscribe & save discount. `total_discount` is the line's share of the order-level code (Shopify allocates it per line and truncates to the cent) plus any automatic product discount, such as the Buy X Get Y that frees the protocol.

Examples with the live plans:

| Cart | Code | Line price | Effective % |
|---|---|---|---|
| 1-Month Plan ($45, 12% plan) | none | $39.60 | 12% |
| 1-Month Plan | 9.09% code | $36.01 | 20% |
| 6-Week Plan ($65, 15% plan) | 9.09% code | $50.23 | 23% |
| 6-Week Tub one-off | 20% code | $52.00 | 20% |

### Top-up formula for new subscription codes

Codes are order-level percentages that stack on the selling plan price. To land on a target total % for a plan that already takes `subscribe %` off:

```
code % = 1 − (1 − target total %) ÷ (1 − subscribe %)
```

| Plan | Subscribe % | Target total | Code % |
|---|---|---|---|
| 1-Month Plan | 12% | 20% | 9.09% |
| 6-Week Plan | 15% | 20% | 5.88% |
| 1-Month Plan | 12% | 25% | 14.77% |

One code can only hit one plan's target exactly, because the same % applies across the whole order. The drawer always shows the true result per line. Set each code's "Recurring payments for subscription products" to "Limit discount to the first payment" so renewals go back to the normal subscribe & save price.

### Things to know

- The 3-Month Plan (selling plan 7141621979) is always two tubs on one line. If an app splits it into two single lines, the drawer repairs it (`BUNDLE_PLANS` in `assets/cart-drawer.js`).
- The free protocol is made free by the native Buy X Get Y discount "FREE Protocol With Subscription". It needs the protocol in the cart and any subscription line. Never make the protocol a $0 product.
- The drawer never reads its layout from `config/settings_data.json` directly; the theme editor writes your values there and Liquid passes them through.
- Text fallbacks for blank settings live in `DEFAULTS` at the top of `assets/cart-drawer.js`, not in Liquid. Shopify's GitHub sync silently rejects any Liquid file that has a `{token}` inside a quoted string, so never write `| default: '{code} applied'` in a `.liquid` file.

### Merging dev to main

Both branches are GitHub-connected themes, so theme-editor saves on each theme are committed to that branch. Before every merge of `dev` into `main`:

1. Pull `origin/main` into `dev` first.
2. Review the diff of `config/settings_data.json` and any `templates/*.json`.
3. If anything other than the intended settings changed, stop and check before merging.
