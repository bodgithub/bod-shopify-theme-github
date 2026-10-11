/**
 * Bodology accessibility helpers (WCAG 2.2 AA).
 *
 * 1. ARIA radio groups — keyboard support for the plan-selector cards
 *    (`[role="radiogroup"] > [role="radio"]`). Space/Enter select the focused
 *    card by firing the exact same click handler the mouse uses; arrow keys move
 *    focus and selection (wrapping); only the checked card sits in the tab order.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* 1. ARIA radio groups                                                */
  /* ------------------------------------------------------------------ */
  var RADIO = '[role="radio"]';
  var GROUP = '[role="radiogroup"]';

  function radiosIn(group) {
    return Array.prototype.slice.call(group.querySelectorAll(RADIO)).filter(function (r) {
      return r.closest(GROUP) === group;
    });
  }

  function syncTabindex(group) {
    var radios = radiosIn(group);
    if (!radios.length) return;
    var checked = radios.filter(function (r) { return r.getAttribute('aria-checked') === 'true'; })[0] || radios[0];
    radios.forEach(function (r) { r.setAttribute('tabindex', r === checked ? '0' : '-1'); });
  }

  function initGroup(group) {
    if (group.__bodRadio) return;
    group.__bodRadio = true;
    syncTabindex(group);
    if (window.MutationObserver) {
      // The plan-selector scripts toggle aria-checked on click (and via the
      // subscribe switch). Keep the roving tabindex in step with them.
      new MutationObserver(function () { syncTabindex(group); })
        .observe(group, { attributes: true, attributeFilter: ['aria-checked'], subtree: true });
    }
  }

  function initGroups(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll(GROUP), initGroup);
  }

  document.addEventListener('keydown', function (e) {
    if (!e.target || !e.target.closest) return;
    var radio = e.target.closest(RADIO);
    // Only act when the card itself is focused — not a button nested inside it.
    if (!radio || e.target !== radio) return;
    var group = radio.closest(GROUP);
    if (!group) return;
    initGroup(group);

    var radios = radiosIn(group);
    var i = radios.indexOf(radio);
    var next = null;
    switch (e.key) {
      case ' ':
      case 'Spacebar':
      case 'Enter':
        next = radio; break;
      case 'ArrowDown':
      case 'ArrowRight':
        next = radios[(i + 1) % radios.length]; break;
      case 'ArrowUp':
      case 'ArrowLeft':
        next = radios[(i - 1 + radios.length) % radios.length]; break;
      default:
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    if (next !== radio) next.focus();
    next.click(); // same code path as a mouse click: price, CTA and aria-checked all update there
    syncTabindex(group);
  }, true);

  // Groups rendered later (theme editor, section re-renders) are picked up on focus.
  document.addEventListener('focusin', function (e) {
    var group = e.target && e.target.closest ? e.target.closest(GROUP) : null;
    if (group) initGroup(group);
  });
  document.addEventListener('shopify:section:load', function (e) { initGroups(e.target); });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initGroups(); });
  } else {
    initGroups();
  }
})();
