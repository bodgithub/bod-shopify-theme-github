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
