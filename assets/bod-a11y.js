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

  /* ------------------------------------------------------------------ */
  /* 2. Side panels / cart drawer dialog                                 */
  /*    - every .side-panel is `inert` while closed (they sit off-screen */
  /*      but in the DOM, so they used to be reachable with Tab);        */
  /*    - the cart drawer (role="dialog") moves focus to its heading on  */
  /*      open, traps Tab / Shift+Tab, makes the rest of the page inert, */
  /*      and returns focus to the element that opened it on close.      */
  /* ------------------------------------------------------------------ */
  var FOCUSABLE = 'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

  function isVisible(el) { return !!(el.getClientRects().length) && getComputedStyle(el).visibility !== 'hidden'; }

  function initPanel(panel) {
    if (panel.__bodPanel) return;
    panel.__bodPanel = true;
    var isDialog = panel.getAttribute('role') === 'dialog';
    var isOpen = false, opener = null;

    function focusables() {
      return Array.prototype.filter.call(panel.querySelectorAll(FOCUSABLE), isVisible);
    }
    function backgroundNodes() {
      var wrapper = document.getElementById('wrapper');
      if (!wrapper) return [];
      return Array.prototype.filter.call(wrapper.children, function (el) {
        return el !== panel && !el.classList.contains('click-capture') && !el.classList.contains('click-capture--product');
      });
    }
    function setBackgroundInert(on) {
      backgroundNodes().forEach(function (el) {
        if (on) {
          if (!el.hasAttribute('inert')) { el.setAttribute('inert', ''); el.setAttribute('data-bod-inert', ''); }
        } else if (el.hasAttribute('data-bod-inert')) {
          el.removeAttribute('inert'); el.removeAttribute('data-bod-inert');
        }
      });
    }
    function initialFocusTarget() {
      return panel.querySelector('[id$="Heading"][tabindex="-1"]') || focusables()[0] || panel;
    }
    function onOpen() {
      if (isOpen) return;
      isOpen = true;
      panel.removeAttribute('inert');
      if (!isDialog) return;
      opener = (lastOutsideFocus && document.contains(lastOutsideFocus)) ? lastOutsideFocus : document.getElementById('cart-drawer-toggle');
      setBackgroundInert(true);
      setTimeout(function () {
        if (isOpen && !panel.contains(document.activeElement)) initialFocusTarget().focus({ preventScroll: true });
      }, 60);
    }
    function onClose() {
      if (!isOpen) return;
      isOpen = false;
      panel.setAttribute('inert', '');
      if (!isDialog) return;
      setBackgroundInert(false);
      if (opener && document.contains(opener) && typeof opener.focus === 'function') opener.focus({ preventScroll: true });
      opener = null;
    }
    function sync() { panel.classList.contains('active') ? onOpen() : onClose(); }

    if (window.MutationObserver) {
      new MutationObserver(sync).observe(panel, { attributes: true, attributeFilter: ['class'] });
      if (isDialog) {
        // The drawer's contents are re-rendered after every cart change. If that
        // drops focus to <body>, put it back on the heading so it stays inside.
        new MutationObserver(function () {
          if (!isOpen) return;
          var a = document.activeElement;
          if (!a || a === document.body || !panel.contains(a)) initialFocusTarget().focus({ preventScroll: true });
        }).observe(panel, { childList: true });
      }
    }
    if (isDialog) {
      panel.addEventListener('keydown', function (e) {
        if (!isOpen || e.key !== 'Tab') return;
        var f = focusables();
        if (!f.length) { e.preventDefault(); initialFocusTarget().focus(); return; }
        var first = f[0], last = f[f.length - 1], a = document.activeElement;
        if (e.shiftKey) {
          if (a === first || !panel.contains(a) || f.indexOf(a) === -1 && a === initialFocusTarget()) { e.preventDefault(); last.focus(); }
        } else if (a === last || !panel.contains(a)) { e.preventDefault(); first.focus(); }
      });
      // Focus that escapes the dialog (e.g. via a browser shortcut) is pulled back in.
      document.addEventListener('focusin', function (e) {
        if (isOpen && !panel.contains(e.target) && e.target !== document.body) initialFocusTarget().focus({ preventScroll: true });
      });
    }
    sync();
  }

  // Remember what was focused / clicked outside the panels so focus can be
  // returned there on close (Safari doesn't focus buttons on click, hence pointerdown).
  var lastOutsideFocus = null;
  function rememberOutside(target) {
    if (!target || !target.closest || target === document.body) return;
    if (target.closest('.side-panel')) return;
    var el = target.closest('button, a[href], input, select, textarea, [tabindex]') || target;
    lastOutsideFocus = el;
  }
  document.addEventListener('focusin', function (e) { rememberOutside(e.target); });
  document.addEventListener('pointerdown', function (e) { rememberOutside(e.target); }, true);

  function initPanels() { Array.prototype.forEach.call(document.querySelectorAll('.side-panel'), initPanel); }

  /* ------------------------------------------------------------------ */
  /* 3. Non-native buttons                                               */
  /*    Elements marked data-bod-key-click (carousel arrows rendered as  */
  /*    <div role="button">, product thumbnails) activate on Enter/Space */
  /*    exactly like a click.                                            */
  /* ------------------------------------------------------------------ */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    var el = e.target;
    if (!el || !el.hasAttribute || !el.hasAttribute('data-bod-key-click')) return;
    e.preventDefault();
    el.click();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initGroups(); initPanels(); });
  } else {
    initGroups(); initPanels();
  }
})();
