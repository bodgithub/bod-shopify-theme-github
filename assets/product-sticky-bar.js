/**
 *  @class
 *  @function ProductStickyBar
 *
 *  Top sticky add-to-cart bar. Shows once the primary product CTA has
 *  scrolled off the top of the screen, hides again the moment that CTA
 *  is back in view. Sits directly under the header, so it tracks the
 *  header's live bottom edge rather than assuming a fixed height.
 */
if (!customElements.get('product-sticky-bar')) {
  class ProductStickyBar extends HTMLElement {
    connectedCallback() {
      this.header = document.querySelector('.header');
      this.target = this.findTarget();

      if (!this.target) {
        this.remove();
        return;
      }

      this.removeAttribute('hidden');
      this.ticking = false;
      this.visible = false;

      this.onScroll = this.onScroll.bind(this);
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onScroll, { passive: true });

      this.setupCta();
      this.mirrorPrice();
      this.update();
    }

    disconnectedCallback() {
      window.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('resize', this.onScroll);
      if (this.priceObserver) this.priceObserver.disconnect();
    }

    /* The CTA we watch: first match of the selector list inside the product
       information column, falling back to anywhere in the section. */
    findTarget() {
      const selector = this.dataset.target;
      const scope = this.dataset.scope;
      const section = document.getElementById(`shopify-section-${this.dataset.section}`) || document;

      if (scope) {
        const scoped = section.querySelector(scope);
        if (scoped) {
          const match = scoped.querySelector(selector);
          if (match) return match;
        }
      }
      return section.querySelector(selector);
    }

    onScroll() {
      if (this.ticking) return;
      this.ticking = true;
      window.requestAnimationFrame(() => {
        this.ticking = false;
        this.update();
      });
    }

    update() {
      /* Track the header's live bottom edge so the bar drops out from under
         it whether the header is sticky or has scrolled away. */
      let offset = 0;
      if (this.header) {
        offset = Math.max(0, Math.round(this.header.getBoundingClientRect().bottom));
      }
      this.style.setProperty('--psb-top', `${offset}px`);

      /* Visible only once the CTA has passed above the bar's own top edge. */
      const rect = this.target.getBoundingClientRect();
      const shouldShow = rect.bottom <= offset;

      if (shouldShow === this.visible) return;
      this.visible = shouldShow;
      this.classList.toggle('is-visible', shouldShow);
    }

    /* The bar's button drives the real CTA, so plan selectors, selling plans
       and variant state all keep working exactly as they do on the page. */
    setupCta() {
      const button = this.querySelector('[data-psb-cta]');
      if (!button) return;

      button.addEventListener('click', (event) => {
        event.preventDefault();
        this.target.click();
      });

      if (this.target.disabled) {
        button.setAttribute('disabled', 'disabled');
      }
    }

    /* Keep the bar's price in step with the main price element. */
    mirrorPrice() {
      const mirror = this.querySelector('[data-psb-price]');
      const source = document.getElementById(`price-${this.dataset.section}`);
      if (!mirror || !source) return;

      const sync = () => {
        if (mirror.innerHTML !== source.innerHTML) mirror.innerHTML = source.innerHTML;
      };

      this.priceObserver = new MutationObserver(sync);
      this.priceObserver.observe(source, { childList: true, subtree: true, characterData: true });
      sync();
    }
  }

  customElements.define('product-sticky-bar', ProductStickyBar);
}
