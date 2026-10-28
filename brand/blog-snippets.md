# Blog snippets

Paste these into the article HTML editor (the `<>` button in the Shopify article editor).
The styling lives in `assets/bod-article.css`, so the HTML stays plain.

## Bodology note (callout box)

```html
<div class="bod-note">
  <p class="bod-note__label">Bodology note</p>
  <h3>What is PMDD?</h3>
  <p>Premenstrual Dysphoric Disorder (PMDD) affects an estimated 3–8% of women in their reproductive years. It is not bad PMS. PMDD causes severe mood disruption, anxiety and emotional dysregulation in the luteal phase of the menstrual cycle, tied to how the brain responds to hormonal fluctuations.</p>
  <p>Women with PMDD are frequently told they are overreacting. Most go years without an accurate diagnosis. The symptoms are real. They are biological. And they are treatable.</p>
  <p class="bod-note__sign">A diagnosis is not a label. It is information.</p>
</div>
```

Rules: heading in sentence case (acronyms stay capitals), no inline styles, bold words inside the
paragraphs turn brand blue automatically. Notes pasted from Word (a table with a lavender cell) are
restyled by the same stylesheet, but their capitalised headings have to be retyped by hand.

## Sources (end of science articles)

```html
<div class="bod-sources">
  <h2>Sources</h2>
  <ol>
    <li>Author A, Author B. Title of the study. <em>Journal</em>. Year;Vol(Issue):pages. <a href="https://doi.org/..." target="_blank" rel="noopener">doi link</a></li>
    <li>…</li>
  </ol>
</div>
```

Small type, muted colour, a rule above. Keep the inline citations in the text as they are.

## Formula card (product spec block inside an article)

```html
<div class="bod-formula">
  <h3>The formula behind the story</h3>
  <p><strong>Bodology® Inositol</strong>: the 40:1 Myo and D-Chiro blend.</p>
  <ul>
    <li>40:1 Myo to D-Chiro Inositol ratio</li>
    <li>D-chiro sourced from non-GMO carob extract</li>
    <li>Pharmacopoeial grade</li>
    <li>Third-party tested</li>
    <li>Non-GMO, vegan, gluten-free</li>
    <li>Unflavoured powder for accurate dosing</li>
    <li>Made in the USA</li>
  </ul>
  <p class="bod-formula__note">Clinically studied to support … (keep the asterisk; the FDA line follows the card).</p>
  <p class="bod-formula__cta"><a href="https://bodology.co/products/myo-d-chiro-inositol-powder">Shop Bodology Inositol</a></p>
</div>
```

Only facts from `brand/product-facts.md` go in the list. The card renders as a lavender panel with a two-column
check list and a navy button.
