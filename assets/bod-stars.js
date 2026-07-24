/* bod-stars — scroll the page to the Junip review widget on click. */
(function () {
  'use strict';

  var SELECTORS = [
    '#junip-reviews',
    '[class*="junip-product-review"]',
    'junip-product-review-widget',
    '.junip-product-review',
    '[id^="shopify-block-"]:has(.junip-product-review)'
  ];

  function findTarget() {
    var i, el;
    for (i = 0; i < SELECTORS.length; i++) {
      try {
        el = document.querySelector(SELECTORS[i]);
      } catch (e) {
        el = null; /* :has() unsupported */
      }
      if (el) return el;
    }
    var candidates = document.querySelectorAll('[class*="junip"], [id*="junip"]');
    for (i = 0; i < candidates.length; i++) {
      if (candidates[i].tagName !== 'SCRIPT' && candidates[i].tagName !== 'STYLE') {
        return candidates[i];
      }
    }
    return null;
  }

  function headerOffset() {
    var h = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
      10
    );
    if (!h) {
      var header = document.querySelector(
        '.section-header, .header-wrapper, [id*="shopify-section-header"]'
      );
      h = header ? Math.round(header.getBoundingClientRect().height) : 0;
    }
    return h + 16;
  }

  function scrollBehavior() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';
  }

  function scrollToEl(el) {
    var top = el.getBoundingClientRect().top + window.pageYOffset - headerOffset();
    window.scrollTo({ top: Math.max(top, 0), behavior: scrollBehavior() });
  }

  document.addEventListener('click', function (event) {
    if (!event.target.closest) return;
    var link = event.target.closest('.bod-stars');
    if (!link) return;
    event.preventDefault();

    var target = findTarget();
    if (target) {
      scrollToEl(target);
      return;
    }

    /* Junip loads async — poll briefly before giving up. */
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      var el = findTarget();
      if (el) {
        clearInterval(timer);
        scrollToEl(el);
      } else if (tries >= 20) {
        clearInterval(timer);
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: scrollBehavior()
        });
      }
    }, 150);
  });
})();
