/* ============================================================
   Bodology — Product landing page CRO enhancements
   Loaded only by templates/product.product-landing-page-v2.json

   SAFE BY DEFAULT: every business-specific input below is gated.
   Features stay inert until you fill the constants in CONFIG.
   ============================================================ */
(function () {
  'use strict';

  var CONFIG = {
    // Auto-apply discount on the buy CTA. Leave '' to disable (no wrong code risk).
    discountCode: '',

    // Exit-intent offer modal. Modal stays OFF until BOTH are set.
    // klaviyoCompanyId is your Klaviyo public API key (6-char).
    klaviyoCompanyId: '',
    klaviyoListId: '',
    modalHeadline: 'Before you go',
    modalBody: 'Get your first order offer sent straight to your inbox.',

    // Message-match by ad lens: /products/...?lens=pcos (etc.)
    // No lens param = page is left exactly as authored (no swap).
    lensCopy: {
      pcos:       { h: "PCOS symptoms aren't just hormonal. They're metabolic.", s: "The metabolic root most plans miss — and what actually helps." },
      hormones:   { h: "When metabolism is balanced, hormones follow.",          s: "Cravings, mood dips and irregular cycles are connected signals." },
      fertility:  { h: "Trying to conceive starts with steadier cycles.",         s: "Cycle regularity begins with metabolic health." },
      metabolism: { h: "Balanced hormones begin with metabolic health.",          s: "Cravings, mood swings and fatigue are metabolic signals." },
      mood:       { h: "Mood dips before your period aren't a character flaw.",   s: "They're connected to how your body handles blood sugar." }
    }
  };

  function track(name, detail) {
    detail = detail || {};
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: 'cro_' + name }, detail));
    } catch (e) {}
    try { document.dispatchEvent(new CustomEvent('cro:' + name, { detail: detail })); } catch (e) {}
    // Klaviyo activity feed (no-op if Klaviyo not present)
    try {
      if (window.klaviyo && typeof window.klaviyo.push === 'function') {
        window.klaviyo.push(['track', 'CRO ' + name, detail]);
      }
    } catch (e) {}
  }

  function param(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  /* --- 1. Message-match: swap hero copy by ad lens ------------------ */
  function applyLensSwap() {
    var lens = (param('lens') || '').toLowerCase();
    var copy = CONFIG.lensCopy[lens];
    if (!copy) return;
    var h = document.querySelector('.js-lens-headline');
    var s = document.querySelector('.js-lens-subcopy');
    if (h && copy.h) h.innerHTML = copy.h;
    if (s && copy.s) s.innerHTML = copy.s;
    document.documentElement.setAttribute('data-lens', lens);
    track('lens_match', { lens: lens });
  }

  /* --- 2. Auto-apply discount to the buy CTA ----------------------- */
  function applyDiscount() {
    var code = CONFIG.discountCode.trim();
    if (!code) return;
    // Persist the code so it applies through Shopify checkout.
    document.querySelectorAll('a[href*="/cart"], a[href*="/checkout"]').forEach(function (a) {
      try {
        var u = new URL(a.href, window.location.origin);
        u.searchParams.set('discount', code);
        a.href = u.toString();
      } catch (e) {}
    });
  }

  /* --- 3. Funnel instrumentation ----------------------------------- */
  function instrument() {
    document.addEventListener('click', function (e) {
      var atc = e.target.closest('[name="add"], .product-form__submit, .shopify-payment-button button');
      if (atc) track('add_to_cart_click', { label: (atc.textContent || '').trim().slice(0, 40) });
      var rev = e.target.closest('a[href="#reviews"], a[href*="#reviews"]');
      if (rev) track('reviews_click', {});
    }, true);

    document.addEventListener('change', function (e) {
      if (e.target.closest('variant-radios, variant-selects, .product-form, [name^="options"]')) {
        track('variant_change', { value: (e.target.value || '').slice(0, 40) });
      }
    }, true);

    var marks = [25, 50, 75, 100], fired = {};
    window.addEventListener('scroll', function () {
      var d = document.documentElement;
      var pct = (d.scrollTop + window.innerHeight) / d.scrollHeight * 100;
      marks.forEach(function (m) {
        if (pct >= m && !fired[m]) { fired[m] = true; track('scroll_depth', { percent: m }); }
      });
    }, { passive: true });
  }

  /* --- 4. Exit-intent offer modal (gated) -------------------------- */
  function exitIntent() {
    if (!CONFIG.klaviyoCompanyId || !CONFIG.klaviyoListId) return;
    if (sessionStorage.getItem('cro_modal_seen')) return;

    var modal = document.createElement('div');
    modal.className = 'cro-modal';
    modal.innerHTML =
      '<div class="cro-modal__card">' +
      '<button class="cro-modal__close" aria-label="Close">&times;</button>' +
      '<h3 class="cro-modal__title">' + CONFIG.modalHeadline + '</h3>' +
      '<p class="cro-modal__body">' + CONFIG.modalBody + '</p>' +
      '<form class="cro-modal__form"><input type="email" required placeholder="you@email.com">' +
      '<button type="submit">Send it</button></form>' +
      '<p class="cro-modal__fineprint">No spam. Unsubscribe anytime.</p>' +
      '</div>';
    document.body.appendChild(modal);

    function open() {
      if (sessionStorage.getItem('cro_modal_seen')) return;
      modal.classList.add('is-open');
      sessionStorage.setItem('cro_modal_seen', '1');
      track('exit_modal_open', {});
    }
    function close() { modal.classList.remove('is-open'); }

    modal.querySelector('.cro-modal__close').addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });

    modal.querySelector('.cro-modal__form').addEventListener('submit', function (e) {
      e.preventDefault();
      var email = modal.querySelector('input[type="email"]').value;
      fetch('https://a.klaviyo.com/client/subscriptions/?company_id=' + CONFIG.klaviyoCompanyId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', revision: '2024-10-15' },
        body: JSON.stringify({ data: { type: 'subscription', attributes: {
          profile: { data: { type: 'profile', attributes: { email: email } } }
        }, relationships: { list: { data: { type: 'list', id: CONFIG.klaviyoListId } } } } })
      }).catch(function () {});
      track('exit_modal_submit', {});
      close();
    });

    document.addEventListener('mouseout', function (e) {
      if (e.clientY <= 0 && !e.relatedTarget) open();
    });
  }

  function init() {
    applyLensSwap();
    applyDiscount();
    instrument();
    exitIntent();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
