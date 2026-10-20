/* bod cart drawer build 2026-10-20.4 */
/*
  Bodology cart drawer — one data model, three designs (A/B/C).

  Data in:  the JSON blob snippets/cart-drawer.liquid emits inside #Cart-Drawer
            (cart object as /cart.js returns it + per-line metafields + settings).
  Render:   buildState() turns it into one state object; renderA/B/C turn that
            into HTML. Every price and % comes from Shopify's own numbers:
              line price after everything = original_line_price - total_discount
              effective %                 = 1 - that / (list price × qty)
            so the drawer matches checkout by construction.
  Summary:  subtotal = product list prices (a free protocol is "Included", not
            a value line). One row per discount type: a code on subscription
            lines merges with the plan saving into one row whose % is the
            combined amount over list; a code on one-time lines gets its own row.
  Refresh:  the theme's CartDrawer class (app.js) and this file both replace
            #Cart-Drawer's children with a freshly rendered section after any
            cart change; a MutationObserver re-renders from the new JSON.
*/
(function () {
  'use strict';
  if (window.__bodCartDrawer) { return; }
  window.__bodCartDrawer = true;

  var HOST_ID = 'Cart-Drawer';
  var LS_OVERRIDE = 'bod_cart_design';
  var LS_SPLIT = 'bod_cart_design_split';
  var LS_CODE = 'bod_cart_code'; /* a family code typed before anything in the cart qualified */
  var SECTIONS = ['cart-drawer', 'cart-bubble'];

  /* Fallbacks for any theme setting left blank. The theme editor normally fills
     these from settings_schema.json; this just keeps the drawer sane without them. */
  var DEFAULTS = {
    design: "a",
    code_field: "collapsed",
    code_banner: "{code} applied: {percent}% off your first order",
    code_banner_mixed: "{code} applied",
    code_label: "Discount code",
    code_other_label: "Have a different code?",
    code_another_label: "Got another code? Enter it here",
    code_placeholder: "Promo or coupon code",
    code_apply_label: "Apply",
    code_change_label: "Change",
    code_applied_line: "{code} applied: \u2212{amount}",
    invalid_code_text: "That code isn't valid.",
    code_rules: "TRY20 -> TRY20 : plan 6331924699\nTRY20 -> TRY20- : plan 5755961563\nTRY20 -> -TRY20 : one-time",
    code_held_text: "{code} is saved. It applies as soon as a qualifying item is in your cart.",
    code_beaten_text: "Your bundle is already {percent}% off, which beats {code}.",
    plan_subtitle: "Ships every {interval} \u00b7 cancel anytime",
    renewal_text: "Renews every {interval} at {renewal_price} until you cancel. Skip or cancel anytime in your account.",
    plan_intervals: "6331924699: 4 weeks\n5755961563: 6 weeks\n7141621979: 3 months",
    oneoff_subtitle: "One-time purchase",
    badge_text: "{percent}% OFF",
    qty_text: "Qty {qty}",
    free_label: "FREE",
    protocol_value: "49.00",
    protocol_line_free: "Included with your subscription \u00b7 emailed after purchase",
    protocol_line_locked: "Free with any subscription \u00b7 emailed after purchase",
    protocol_nudge_text: "Add your free {protocol} ({value} value)",
    protocol_nudge_button: "Add",
    shipping_unlocked: "Free shipping unlocked",
    shipping_remaining: "Spend {amount} more for free shipping",
    protocol_unlocked: "Free protocol unlocked",
    protocol_locked: "Subscribe to unlock the free protocol",
    upsell_text: "Switch to {target}: save {percent}%{protocol_text}",
    upsell_protocol_text: " and get the protocol free",
    upsell_map: "46444657279195: 6331924699\n46444646269147: 5755961563",
    bundle_plans: "7141621979: 2",
    label_subtotal: "Subtotal",
    label_subscribe_save: "Subscribe & save",
    label_code_row: "{code} ({percent}% off)",
    label_combined_row: "{code} + subscription ({percent}% off)",
    label_code_prefix: "Code",
    label_protocol_row: "Free protocol with subscription",
    label_included: "Included",
    label_shipping: "Shipping",
    label_total: "Total today",
    label_savings_heading: "YOUR SAVINGS",
    label_total_saved: "Total saved today",
    savings_text: "You're saving {amount} today",
    savings_text_protocol: "You're saving {amount} + a free protocol",
    b_heading: "YOUR FIRST ORDER",
    b_heading_oneoff: "YOUR ORDER",
    b_save_pill: "You save {amount}",
    b_coupon_text: "{percent}% off applied",
    checkout_text: "Secure checkout \u00b7 {total}",
    checkout_text_b: "Checkout",
    checkout_text_c: "Checkout securely",
    trust_1: "3rd-party tested",
    trust_2: "Free US shipping",
    trust_3: "Cancel anytime",
    title: "Your cart",
    empty_text: "Your cart is currently empty.",
    empty_cta: "Start shopping"
  };
  function withDefaults(settings) {
    var out = {}; var k;
    for (k in DEFAULTS) { if (Object.prototype.hasOwnProperty.call(DEFAULTS, k)) { out[k] = DEFAULTS[k]; } }
    for (k in settings) {
      if (!Object.prototype.hasOwnProperty.call(settings, k)) { continue; }
      var v = settings[k];
      if (v === null || v === undefined || (typeof v === 'string' && v.trim() === '' && typeof DEFAULTS[k] === 'string')) { continue; }
      out[k] = v;
    }
    return out;
  }

  var pending = { error: null, open: false, code: '' };
  var splitAttrWritten = false;
  var chosen = null; /* { design: 'a'|'b'|'c', source: 'override'|'split'|'setting' } */

  /* ---------- utilities ---------- */
  function host() { return document.getElementById(HOST_ID); }
  function rootUrl() { return (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/'; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function tpl(str, map) {
    return String(str || '').replace(/\{(\w+)\}/g, function (m, k) { return Object.prototype.hasOwnProperty.call(map, k) ? map[k] : m; });
  }
  function uniq(arr) { return arr.filter(function (v, i, a) { return a.indexOf(v) === i; }); }
  function sum(arr, fn) { return arr.reduce(function (t, x) { return t + (fn(x) || 0); }, 0); }
  function parseMap(text) {
    var map = {};
    String(text || '').split(/[\n|]/).forEach(function (line) {
      var m = line.match(/^\s*([^:]+?)\s*:\s*(.+?)\s*$/);
      if (m) { map[m[1]] = m[2]; }
    });
    return map;
  }
  /* Code families. One code the customer types (the alias) stands for several real
     Shopify codes, each tied to a selling plan or a one-time variant, e.g.
       TRY20 -> TRY20  : plan 6331924699
       TRY20 -> TRY20- : plan 5755961563
       TRY20 -> -TRY20 : one-time
     Conditions: "plan <selling plan id>", "subscription" (any plan),
     "one-time [variant id]", "any". Codes compare case-insensitively. The drawer
     applies whichever real codes the cart qualifies for and shows only the alias. */
  function lower(s) { return String(s || '').trim().toLowerCase(); }
  function parseRules(text) {
    var rules = [];
    String(text || '').split(/\n/).forEach(function (line) {
      var m = line.match(/^\s*(\S+)\s*(?:->|=>|→)\s*(\S+)\s*:\s*([a-z\-]+)\s*(\S+)?\s*$/i);
      if (!m) { return; }
      rules.push({ alias: m[1], code: m[2], kind: m[3].toLowerCase().replace(/[^a-z]/g, ''), id: m[4] ? String(m[4]) : null });
    });
    return rules;
  }
  function aliasFor(rules, code) {
    var c = lower(code);
    for (var i = 0; i < rules.length; i++) { if (lower(rules[i].alias) === c || lower(rules[i].code) === c) { return rules[i].alias; } }
    return null;
  }
  function familyCodes(rules, alias) {
    return uniq(rules.filter(function (r) { return lower(r.alias) === lower(alias); }).map(function (r) { return r.code; }));
  }
  function ruleMatches(r, l) {
    if (l.type === 'protocol') { return false; }
    if (r.kind === 'any') { return true; }
    if (r.kind === 'plan') { return l.type === 'subscription' && String(l.plan.id) === r.id; }
    if (r.kind === 'subscription') { return l.type === 'subscription'; }
    if (r.kind === 'onetime') { return l.type === 'oneoff' && (!r.id || String(l.variantId) === r.id); }
    return false;
  }
  function desiredCodes(rules, alias, lines) {
    return uniq(rules.filter(function (r) {
      return lower(r.alias) === lower(alias) && lines.some(function (l) { return ruleMatches(r, l); });
    }).map(function (r) { return r.code; }));
  }
  function codeApplicable(res, c) {
    return ((res && res.discount_codes) || []).some(function (d) { return lower(d.code) === lower(c) && d.applicable; });
  }
  function sameCodes(a, b) {
    var x = uniq(a.map(lower)).sort(), y = uniq(b.map(lower)).sort();
    return x.length === y.length && x.every(function (v, i) { return v === y[i]; });
  }
  var ls = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} },
    remove: function (k) { try { window.localStorage.removeItem(k); } catch (e) {} }
  };
  function money(cents, fmt) {
    fmt = fmt || '${{amount}}';
    var v = (Number(cents) || 0) / 100;
    function num(dec, thou, deci) {
      var parts = Math.abs(v).toFixed(dec).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thou);
      return (v < 0 ? '-' : '') + parts.join(deci);
    }
    var m = fmt.match(/\{\{\s*(\w+)\s*\}\}/);
    var out;
    switch (m ? m[1] : 'amount') {
      case 'amount_no_decimals': out = num(0, ',', '.'); break;
      case 'amount_with_comma_separator': out = num(2, '.', ','); break;
      case 'amount_no_decimals_with_comma_separator': out = num(0, '.', ','); break;
      case 'amount_with_apostrophe_separator': out = num(2, "'", '.'); break;
      default: out = num(2, ',', '.');
    }
    return fmt.replace(/\{\{\s*\w+\s*\}\}/, out).replace(/<[^>]*>/g, '');
  }
  function shortPlan(name) { return String(name || '').replace(/^\s*subscription\s*:\s*/i, '').trim(); }
  function intervalFromName(name) {
    var m = String(name || '').match(/(\d+)\s*[- ]?\s*(week|month|year)s?/i);
    if (!m) { return shortPlan(name); }
    var n = parseInt(m[1], 10);
    return n + ' ' + m[2].toLowerCase() + (n > 1 ? 's' : '');
  }

  /* ---------- data ---------- */
  function readData() {
    var h = host(); if (!h) { return null; }
    var el = h.querySelector('script[data-bod-cart-data]'); if (!el) { return null; }
    try { return JSON.parse(el.textContent); } catch (e) { return null; }
  }

  function handleUrlOverride() {
    var p;
    try { p = new URLSearchParams(window.location.search).get('cart_design'); } catch (e) { p = null; }
    if (!p) { return; }
    p = p.toLowerCase();
    if (p === 'reset') { ls.remove(LS_OVERRIDE); ls.remove(LS_SPLIT); }
    else if (/^[abc]$/.test(p)) { ls.set(LS_OVERRIDE, p); }
  }
  function chooseDesign(setting) {
    var o = ls.get(LS_OVERRIDE);
    if (o && /^[abc]$/.test(o)) { return { design: o, source: 'override' }; }
    if (setting === 'random') {
      var s = ls.get(LS_SPLIT);
      if (!s || !/^[abc]$/.test(s)) { s = 'abc'.charAt(Math.floor(Math.random() * 3)); ls.set(LS_SPLIT, s); }
      return { design: s, source: 'split' };
    }
    return { design: /^[abc]$/.test(setting || '') ? setting : 'a', source: 'setting' };
  }

  function buildState(data) {
    var S = withDefaults(data.settings || {});
    var cart = data.cart || { items: [] };
    var fmt = data.money_format;
    var intervals = parseMap(S.plan_intervals);
    var upsellMap = parseMap(S.upsell_map);
    var cartLevel = cart.cart_level_discount_applications || [];
    /* Applied codes. /cart.js has discount_codes[]; Liquid's cart | json does not, so
       collect every discount application of type discount_code, order-level
       (cart_level_discount_applications) and product-level (line allocations). Only
       codes that actually apply appear there, which is exactly the set we want. */
    var codeApps = cartLevel.filter(function (d) { return d.type === 'discount_code'; });
    var otherOrder = cartLevel.filter(function (d) { return d.type !== 'discount_code'; });
    (cart.items || []).forEach(function (i) {
      (i.line_level_discount_allocations || []).forEach(function (al) {
        var app = al.discount_application;
        if (app && app.type === 'discount_code') { codeApps.push({ title: app.title, total_allocated_amount: al.amount, _line: true }); }
      });
    });
    var codes = cart.discount_codes
      ? cart.discount_codes.filter(function (c) { return c.applicable; }).map(function (c) { return c.code; })
      : uniq(codeApps.map(function (d) { return d.title; }));
    var codeSet = {};
    codes.forEach(function (c) { codeSet[String(c).toLowerCase()] = true; });
    /* what the customer sees: a family member shows as its alias (MY20-, -MY20 -> MY20) */
    var rules = parseRules(S.code_rules);
    var codeNames = uniq(codes.map(function (c) { return aliasFor(rules, c) || c; }));
    var codeTotal = sum(codeApps, function (d) { return d.total_allocated_amount; });
    var otherOrderRows = otherOrder.filter(function (d) { return d.total_allocated_amount > 0; }).map(function (d) { return { title: d.title, amount: d.total_allocated_amount }; });
    var protocolValue = Math.round(parseFloat(S.protocol_value || '49') * 100) || 4900;
    var protocolIds = (data.protocol && data.protocol.variant_ids || []).map(String);
    var byKey = {};
    (cart.items || []).forEach(function (i) { byKey[i.key] = i; });

    var lines = [];
    (data.lines || []).forEach(function (meta, idx) {
      var item = byKey[meta.key] || (cart.items || [])[idx];
      if (!item) { return; }
      var qty = item.quantity;
      /* protocol = the picked protocol product; until that setting is filled in,
         fall back to the free-gift line the product page adds (_gift property) */
      var isProtocol = !!meta.is_protocol || protocolIds.indexOf(String(meta.variant_id)) >= 0 || (!data.protocol && !!meta.is_gift);
      var type = isProtocol ? 'protocol' : (item.selling_plan_allocation ? 'subscription' : 'oneoff');
      var listUnit = isProtocol ? protocolValue : (meta.list_unit || item.original_price);
      var list = listUnit * qty;
      var orig = item.original_line_price;
      var disc = item.total_discount || 0;
      var first = orig - disc;
      var codeShare = 0, productDisc = 0;
      (item.discounts || []).forEach(function (d) {
        if (codeSet[String(d.title || '').toLowerCase()]) { codeShare += d.amount || 0; } else { productDisc += d.amount || 0; }
      });
      var pct = list > 0 ? Math.round((1 - first / list) * 100) : 0;
      if (pct < 0) { pct = 0; }
      var plan = null;
      if (item.selling_plan_allocation) {
        var sp = item.selling_plan_allocation;
        var pid = String(sp.selling_plan.id);
        var pname = sp.selling_plan.name || '';
        plan = {
          id: pid, name: pname, short: shortPlan(pname),
          interval: intervals[pid] || intervalFromName(pname),
          unit: sp.price, renewal: sp.price * qty,
          pct: listUnit > 0 ? Math.round((1 - sp.price / listUnit) * 100) : 0
        };
      }
      var upsell = null;
      if (type === 'oneoff' && S.upsell) {
        var tid = String(meta.upsell_plan_id || upsellMap[String(meta.variant_id)] || '');
        var opt = (meta.plan_options || []).filter(function (o) { return String(o.id) === tid; })[0];
        if (opt) {
          upsell = {
            planId: tid, name: shortPlan(opt.name),
            pct: listUnit > 0 ? Math.round((1 - opt.price / listUnit) * 100) : 0,
            variantId: meta.upsell_variant_id ? String(meta.upsell_variant_id) : null
          };
        }
      }
      lines.push({
        key: item.key, keys: [item.key], qty: qty, type: type,
        title: meta.display_name || meta.title, productTitle: meta.title,
        image: meta.image, imageAlt: meta.image_alt, url: meta.url,
        variantId: String(meta.variant_id),
        listUnit: listUnit, list: list, orig: orig, disc: disc, first: first,
        codeShare: codeShare, productDisc: productDisc, pct: pct, plan: plan, upsell: upsell,
        hideBadge: !!meta.hide_badge, isFree: first === 0 && orig > 0,
        qualifies: meta.qualifies_for_protocol !== false, isGift: !!meta.is_gift
      });
    });

    /* Shopify splits a multi-unit subscription line (e.g. the 3-Month Plan's two
       tubs) into separate lines when the Buy X Get Y protocol discount applies.
       The customer bought one plan, so show one row: merge lines with the same
       variant + selling plan. */
    var merged = [], byPlan = {};
    lines.forEach(function (l) {
      var k = l.type === 'subscription' && !l.isGift ? l.variantId + '|' + l.plan.id : null;
      if (k && byPlan[k]) {
        var m = byPlan[k];
        m.keys.push(l.key); m.qty += l.qty; m.list += l.list; m.orig += l.orig; m.disc += l.disc; m.first += l.first;
        m.codeShare += l.codeShare; m.productDisc += l.productDisc;
        m.plan.renewal = m.plan.unit * m.qty;
        m.pct = m.list > 0 ? Math.max(0, Math.round((1 - m.first / m.list) * 100)) : 0;
        m.isFree = m.first === 0 && m.orig > 0;
        return;
      }
      if (k) { byPlan[k] = l; }
      merged.push(l);
    });
    lines = merged;
    /* protocol lines last, everything else in cart order */
    lines = lines.filter(function (l) { return l.type !== 'protocol'; }).concat(lines.filter(function (l) { return l.type === 'protocol'; }));
    var subs = lines.filter(function (l) { return l.type === 'subscription'; });
    var oneoffs = lines.filter(function (l) { return l.type === 'oneoff'; });
    var protos = lines.filter(function (l) { return l.type === 'protocol'; });
    var eligible = subs.some(function (l) { return l.qualifies; });
    /* banner %: the one effective first-order % when every product line agrees */
    var products = subs.concat(oneoffs);
    var pcts = uniq(products.map(function (l) { return l.pct; }));
    var bannerPct = pcts.length === 1 ? pcts[0] : null;
    var planPcts = uniq(subs.map(function (l) { return l.plan.pct; }));
    var listTotal = sum(lines, function (l) { return l.list; });
    var protocolFree = protos.some(function (l) { return l.isFree; });
    /* subtotal = the products at list price; a free protocol is "Included", not a value line */
    var subtotal = sum(lines, function (l) { return (l.type === 'protocol' && l.isFree) ? 0 : l.list; });
    var total = cart.total_price || 0;
    var saved = Math.max(0, subtotal - total);
    var subList = sum(subs, function (l) { return l.list; });
    var subSave = sum(subs, function (l) { return l.list - l.orig; });
    var subCode = sum(subs, function (l) { return l.codeShare; });
    var oneList = sum(oneoffs, function (l) { return l.list; });
    var oneCode = sum(oneoffs, function (l) { return l.codeShare; });
    var freeMin = parseInt(S.free_shipping_minimum, 10) || 0;
    var freeShipOn = !!S.free_shipping && freeMin > 0;
    var freeShip = freeShipOn && total >= freeMin;

    return {
      S: S, cart: cart, fmt: fmt, lines: lines, subs: subs, oneoffs: oneoffs, protos: protos,
      count: cart.item_count || 0, empty: !lines.length,
      codes: codes, hasCode: codes.length > 0, codeName: codeNames.join(' + '), rules: rules,
      codeTotal: codeTotal, otherOrderRows: otherOrderRows, bannerPct: bannerPct,
      eligible: eligible, protocolInCart: protos.length > 0,
      protocolFree: protocolFree,
      protocol: data.protocol || null,
      listTotal: listTotal, subtotal: subtotal, total: total, saved: saved,
      subList: subList, subSave: subSave, subCode: subCode, oneList: oneList, oneCode: oneCode,
      protoSave: sum(protos, function (l) { return l.productDisc; }),
      planPct: planPcts.length === 1 ? planPcts[0] : null,
      freeShipOn: freeShipOn, freeShip: freeShip, freeMin: freeMin,
      shipRemaining: Math.max(0, freeMin - total),
      shipProgress: freeShipOn ? Math.min(1, total / freeMin) : 1,
      money: function (c) { return money(c, fmt); },
      cartUrl: (data.routes && data.routes.cart) || '/cart'
    };
  }

  /* ---------- shared partials ---------- */
  var ICON = {
    close: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    trash: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    tag: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12V4h8l10 10-8 8L3 12z"/><circle cx="7.5" cy="8.5" r="1.5"/></svg>',
    lock: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>',
    truck: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
    loop: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 0114-5.3M20 12a8 8 0 01-14 5.3M18 3v4h-4M6 21v-4h4"/></svg>',
    swap: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>'
  };

  function header(st, withCount) {
    return '<div class="bod-cart__header"><h2 class="bod-cart__title" id="CartDrawerHeading" tabindex="-1">' + esc(st.S.title) +
      (withCount ? ' <span class="bod-cart__count">(' + st.count + ')</span>' : '') + '</h2>' +
      '<side-panel-close class="side-panel-close"><button type="button" class="side-panel-close__button bod-cart__close" aria-label="Close cart">' + ICON.close + '</button></side-panel-close></div>';
  }
  function emptyState(st) {
    return '<div class="bod-cart__empty"><p>' + esc(st.S.empty_text) + '</p><a class="bod-cart__btn bod-cart__btn--primary" href="' + esc(st.S.empty_url || '/') + '">' + esc(st.S.empty_cta) + '</a></div>';
  }
  function bannerText(st) {
    if (!st.hasCode) { return ''; }
    return st.bannerPct === null
      ? tpl(st.S.code_banner_mixed, { code: st.codeName })
      : tpl(st.S.code_banner, { code: st.codeName, percent: st.bannerPct });
  }
  function subtitle(st, l) {
    if (l.type === 'protocol') { return l.isFree ? st.S.protocol_line_free : st.S.protocol_line_locked; }
    if (l.type === 'subscription') { return tpl(st.S.plan_subtitle, { interval: l.plan.interval, plan: l.plan.short }); }
    return st.S.oneoff_subtitle;
  }
  function renewalText(st, l) {
    return tpl(st.S.renewal_text, { interval: l.plan.interval, renewal_price: st.money(l.plan.renewal), plan: l.plan.short });
  }
  function badge(st, l) {
    if (l.type === 'protocol' || l.hideBadge || l.pct <= 0) { return ''; }
    return '<span class="bod-cart__badge">' + esc(tpl(st.S.badge_text, { percent: l.pct })) + '</span>';
  }
  function qtyLabel(st, l) {
    return l.qty > 1 ? '<span class="bod-cart__qty">' + esc(tpl(st.S.qty_text, { qty: l.qty })) + '</span>' : '';
  }
  function removeBtn(l) {
    return '<button type="button" class="bod-cart__remove" data-bod-action="remove" data-key="' + esc(l.keys.join(',')) + '" aria-label="Remove ' + esc(l.productTitle) + '">' + ICON.trash + '</button>';
  }
  function image(l, size) {
    if (!l.image) { return '<div class="bod-cart__img bod-cart__img--empty" style="width:' + size + 'px;height:' + size + 'px"></div>'; }
    return '<img class="bod-cart__img" src="' + esc(l.image) + '" width="' + size + '" height="' + size + '" alt="' + esc(l.imageAlt) + '" loading="lazy">';
  }
  function upsellRow(st, l) {
    if (!l.upsell) { return ''; }
    var unlocks = !st.eligible && !!st.protocol;
    var text = tpl(st.S.upsell_text, { target: l.upsell.name, percent: l.upsell.pct, protocol_text: unlocks ? st.S.upsell_protocol_text : '' });
    return '<button type="button" class="bod-cart__upsell" data-bod-action="swap" data-key="' + esc(l.key) + '" data-plan="' + esc(l.upsell.planId) +
      '" data-line-variant="' + esc(l.variantId) + '"' + (l.upsell.variantId ? ' data-variant="' + esc(l.upsell.variantId) + '"' : '') + '>' + ICON.swap + '<span>' + esc(text) + '</span></button>';
  }
  function protocolNudge(st) {
    if (!st.S.protocol_nudge || !st.protocol || !st.eligible || st.protocolInCart) { return ''; }
    var text = tpl(st.S.protocol_nudge_text, { protocol: st.protocol.title, value: st.money(Math.round(parseFloat(st.S.protocol_value || '49') * 100)) });
    return '<div class="bod-cart__nudge">' + (st.protocol.image ? '<img class="bod-cart__img" src="' + esc(st.protocol.image) + '" width="48" height="48" alt="" loading="lazy">' : '') +
      '<div class="bod-cart__nudge-text">' + esc(text) + '</div><button type="button" class="bod-cart__btn bod-cart__btn--outline" data-bod-action="add-protocol">' + esc(st.S.protocol_nudge_button) + '</button></div>';
  }
  function priceCells(st, l) {
    if (l.type === 'protocol' && l.isFree) {
      return '<span class="bod-cart__price bod-cart__price--free">' + esc(st.S.free_label) + '</span><span class="bod-cart__strike">' + esc(st.money(l.list)) + '</span>';
    }
    var out = '<span class="bod-cart__price">' + esc(st.money(l.first)) + '</span>';
    if (l.first < l.list) { out += '<span class="bod-cart__strike">' + esc(st.money(l.list)) + '</span>'; }
    return out;
  }
  function codeField(st, variant) {
    var S = st.S, mode = S.code_field || 'collapsed';
    if (mode === 'hidden') { return ''; }
    var err = pending.error, value = pending.code || '';
    var note = err ? '' : heldNote(st);
    var msg = err ? '<div class="bod-cart__code-msg is-error" role="alert">' + esc(err) + '</div>' : '<div class="bod-cart__code-msg' + (note ? ' is-note' : '') + '" role="status" aria-live="polite">' + esc(note) + '</div>';
    var input = function (extra) {
      return '<input id="BodCartCode" name="discount" type="text" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" placeholder="' + esc(S.code_placeholder) + '" value="' + esc(value) + '"' + (extra || '') + '>';
    };
    var applyBtn = '<button type="submit" class="bod-cart__btn bod-cart__code-apply">' + esc(S.code_apply_label) + '</button>';

    if (variant === 'b') {
      if (st.hasCode && !pending.open) {
        return '<form class="bod-cart__code bod-cart__code--b is-applied" data-bod-code novalidate><label for="BodCartCode">' + esc(S.code_label) + '</label>' +
          '<div class="bod-cart__code-row"><input id="BodCartCode" name="discount" type="text" value="' + esc(st.codeName) + '" readonly aria-describedby="BodCartCodeApplied">' +
          '<button type="button" class="bod-cart__btn bod-cart__btn--outline bod-cart__code-change" data-bod-action="change-code">' + esc(S.code_change_label) + '</button></div>' +
          '<div class="bod-cart__code-applied" id="BodCartCodeApplied">' + esc(tpl(S.code_applied_line, { code: st.codeName, amount: st.money(st.codeTotal) })) + '</div>' + msg + '</form>';
      }
      return '<form class="bod-cart__code bod-cart__code--b" data-bod-code novalidate><label for="BodCartCode">' + esc(S.code_label) + '</label><div class="bod-cart__code-row">' + input() + applyBtn + '</div>' + msg + '</form>';
    }
    if (variant === 'c') {
      return '<form class="bod-cart__code bod-cart__code--c" data-bod-code novalidate><label for="BodCartCode">' + esc(S.code_another_label) + '</label><div class="bod-cart__code-row">' + input() + applyBtn + '</div>' + msg + '</form>';
    }
    /* design A: collapsed behind a link once a code is applied */
    var collapsed = mode === 'collapsed' && st.hasCode && !pending.open && !err;
    var form = '<form class="bod-cart__code bod-cart__code--a" data-bod-code novalidate id="BodCartCodeWrap"' + (collapsed ? ' hidden' : '') + '><label for="BodCartCode" class="visually-hidden">' + esc(S.code_label) + '</label><div class="bod-cart__code-row">' + input() + applyBtn + '</div>' + msg + '</form>';
    var link = collapsed ? '<button type="button" class="bod-cart__code-toggle" data-bod-action="toggle-code" aria-expanded="false" aria-controls="BodCartCodeWrap">' + esc(S.code_other_label) + '</button>' : '';
    return link + form;
  }
  function termsBox(st) {
    if (!st.S.terms_enabled || !st.S.terms_html) { return ''; }
    return '<div class="bod-cart__terms"><input type="checkbox" id="CartDrawerTerms" required><label for="CartDrawerTerms">' + st.S.terms_html + '</label></div>';
  }
  function checkoutForm(st, inner, extraClass) {
    return '<form action="' + esc(st.cartUrl) + '" method="post" novalidate class="bod-cart__checkout-form" data-bod-checkout>' +
      '<button type="submit" name="checkout" class="button checkout bod-cart__checkout ' + (extraClass || '') + '">' + inner + '</button></form>';
  }
  function trustInline(st) {
    if (!st.S.trust) { return ''; }
    return '<div class="bod-cart__trust bod-cart__trust--inline"><span>' + esc(st.S.trust_1) + '</span><span>·</span><span>' + esc(st.S.trust_2) + '</span><span>·</span><span>' + esc(st.S.trust_3) + '</span></div>';
  }
  function trustIcons(st) {
    if (!st.S.trust) { return ''; }
    return '<div class="bod-cart__trust bod-cart__trust--icons"><div>' + ICON.lock + esc(st.S.trust_1) + '</div><div>' + ICON.truck + esc(st.S.trust_2) + '</div><div>' + ICON.loop + esc(st.S.trust_3) + '</div></div>';
  }
  function shippingValue(st) {
    if (!st.freeShipOn) { return ''; }
    return '<div class="bod-cart__row"><span class="bod-cart__muted">' + esc(st.S.label_shipping) + '</span><span class="' + (st.freeShip ? 'bod-cart__green' : 'bod-cart__muted') + '">' + esc(st.freeShip ? st.S.free_label : tpl(st.S.shipping_remaining, { amount: st.money(st.shipRemaining) })) + '</span></div>';
  }
  function subSaveLabel(st) {
    return st.S.label_subscribe_save + (st.planPct !== null ? ' (' + st.planPct + '%)' : '');
  }
  /* Summary rows, one per discount type, every figure from the cart object:
       code on subscription lines -> merged with the plan saving into one row
       code on one-time lines     -> its own row
       free protocol              -> "Included", never a minus amount */
  function summaryRows(st) {
    var S = st.S, rows = [];
    if (st.subs.length) {
      if (st.hasCode && st.subCode > 0) {
        var combined = st.subSave + st.subCode;
        var pc = st.subList > 0 ? Math.round(combined / st.subList * 100) : 0;
        rows.push({ label: tpl(S.label_combined_row, { code: st.codeName, percent: pc }), amount: combined, code: true });
      } else if (st.subSave > 0) {
        rows.push({ label: subSaveLabel(st), amount: st.subSave });
      }
    }
    if (st.hasCode && st.oneCode > 0) {
      var pc1 = st.oneList > 0 ? Math.round(st.oneCode / st.oneList * 100) : 0;
      rows.push({ label: tpl(S.label_code_row, { code: st.codeName, percent: pc1 }), amount: st.oneCode, code: true });
    }
    st.otherOrderRows.forEach(function (r) { rows.push({ label: r.title, amount: r.amount }); });
    if (st.protocolFree) { rows.push({ label: S.label_protocol_row, text: S.label_included }); }
    else if (st.protoSave > 0) { rows.push({ label: S.label_protocol_row, amount: st.protoSave }); }
    return rows;
  }
  function summaryRowHtml(st, r, muted) {
    var left = r.code
      ? '<span class="bod-cart__green bod-cart__with-icon">' + ICON.tag + esc(r.label) + '</span>'
      : '<span class="' + (muted ? 'bod-cart__muted' : '') + '">' + esc(r.label) + '</span>';
    var right = r.text !== undefined
      ? '<span class="bod-cart__green">' + esc(r.text) + '</span>'
      : '<span class="bod-cart__green">−' + esc(st.money(r.amount)) + '</span>';
    return '<div class="bod-cart__row">' + left + right + '</div>';
  }
  function savingsText(st) {
    return tpl(st.protocolFree ? st.S.savings_text_protocol : st.S.savings_text, { amount: st.money(st.saved) });
  }
  /* A family code typed while nothing in the cart qualified is held (localStorage)
     and applied the moment a qualifying line arrives. */
  function heldAlias(st) {
    var held = ls.get(LS_CODE); if (!held) { return null; }
    var alias = aliasFor(st.rules, held); if (!alias) { ls.remove(LS_CODE); return null; }
    var fam = familyCodes(st.rules, alias).map(lower);
    if (st.codes.some(function (c) { return fam.indexOf(lower(c)) >= 0; })) { return null; }
    return alias;
  }
  function heldNote(st) {
    var alias = heldAlias(st); if (!alias) { return ''; }
    var unmatched = st.subs.filter(function (l) {
      return !st.rules.some(function (r) { return lower(r.alias) === lower(alias) && ruleMatches(r, l); });
    });
    /* only subscription lines the code has no rule for, each already plan-discounted: the bundle case */
    if (!st.oneoffs.length && st.subs.length && unmatched.length === st.subs.length && unmatched.every(function (l) { return l.plan.pct > 0; })) {
      var top = Math.max.apply(null, unmatched.map(function (l) { return l.plan.pct; }));
      return tpl(st.S.code_beaten_text, { code: alias, percent: top });
    }
    return tpl(st.S.code_held_text, { code: alias });
  }

  /* ---------- design A: code applied banner ---------- */
  function renderA(st) {
    var S = st.S, h = header(st, true);
    if (st.empty) { return h + emptyState(st); }
    var out = h;
    if (st.hasCode) {
      out += '<div class="bod-cart__banner"><div class="bod-cart__banner-icon">' + ICON.check + '</div><div class="bod-cart__banner-text">' + esc(bannerText(st)) + '</div></div>';
    }
    var hasProtocolFeature = !!st.protocol || st.protocolInCart;
    if (st.freeShipOn || hasProtocolFeature) {
      var parts = [], labels = [];
      if (st.freeShipOn) { parts.push(st.freeShip ? 1 : st.shipProgress); labels.push(esc(st.freeShip ? S.shipping_unlocked : tpl(S.shipping_remaining, { amount: st.money(st.shipRemaining) }))); }
      if (hasProtocolFeature) { parts.push(st.eligible ? 1 : 0); labels.push(esc(st.eligible ? S.protocol_unlocked : S.protocol_locked)); }
      var fill = sum(parts, function (x) { return x; }) / parts.length * 100;
      out += '<div class="bod-cart__progress"><div class="bod-cart__progress-labels"><span>' + labels.join('</span><span>') + '</span></div>' +
        '<div class="bod-cart__progress-bar"><div class="bod-cart__progress-fill" style="width:' + Math.round(fill) + '%"></div></div></div>';
    }
    out += '<div class="bod-cart__body">';
    st.lines.forEach(function (l) {
      out += '<div class="bod-cart__line bod-cart__line--' + l.type + '" data-key="' + esc(l.key) + '">' + image(l, 84) +
        '<div class="bod-cart__line-main"><div class="bod-cart__line-top"><div class="bod-cart__line-title">' + esc(l.title) + '</div>' + removeBtn(l) + '</div>' +
        '<div class="bod-cart__line-sub">' + esc(subtitle(st, l)) + '</div>' +
        '<div class="bod-cart__line-price">' + priceCells(st, l) + badge(st, l) + qtyLabel(st, l) + '</div>' +
        (l.type === 'subscription' ? '<div class="bod-cart__renewal">' + esc(renewalText(st, l)) + '</div>' : '') +
        upsellRow(st, l) + '</div></div>';
    });
    out += protocolNudge(st) + '</div>';
    out += '<div class="bod-cart__footer bod-cart__footer--a"><div class="bod-cart__rows">' +
      '<div class="bod-cart__row"><span class="bod-cart__muted">' + esc(S.label_subtotal) + '</span><span>' + esc(st.money(st.subtotal)) + '</span></div>';
    summaryRows(st).forEach(function (r) { out += summaryRowHtml(st, r, true); });
    out += shippingValue(st) + '</div>' +
      '<div class="bod-cart__total"><span>' + esc(S.label_total) + '</span><span class="bod-cart__total-amount">' + esc(st.money(st.total)) + '</span></div>';
    if (S.savings_strip && st.saved > 0) { out += '<div class="bod-cart__strip">' + esc(savingsText(st)) + '</div>'; }
    out += termsBox(st) + checkoutForm(st, ICON.lock + '<span>' + esc(tpl(S.checkout_text, { total: st.money(st.total) })) + '</span>', 'bod-cart__checkout--a') +
      codeField(st, 'a') + trustInline(st) + '</div>';
    return out;
  }

  /* ---------- design B: savings hero ---------- */
  function renderB(st) {
    var S = st.S, h = header(st, false);
    if (st.empty) { return h + emptyState(st); }
    var names = uniq(st.lines.map(function (l) { return l.title; }));
    var summary = names.join(' + ') + (st.freeShip ? ' + shipping' : '') + '.';
    var out = h + '<div class="bod-cart__hero"><div class="bod-cart__hero-eyebrow">' + esc(st.subs.length ? S.b_heading : S.b_heading_oneoff) + '</div>' +
      '<div class="bod-cart__hero-prices"><span class="bod-cart__hero-total">' + esc(st.money(st.total)) + '</span>' + (st.saved > 0 ? '<span class="bod-cart__hero-strike">' + esc(st.money(st.subtotal)) + '</span>' : '') + '</div>' +
      '<div class="bod-cart__hero-summary">' + esc(summary) + (st.saved > 0 ? ' <span class="bod-cart__pill">' + esc(tpl(S.b_save_pill, { amount: st.money(st.saved) })) + '</span>' : '') + '</div>';
    if (st.hasCode) {
      out += '<div class="bod-cart__ticket"><div class="bod-cart__ticket-code">' + ICON.check + '<span>' + esc(st.codeName) + '</span></div><span class="bod-cart__ticket-right">' +
        esc(st.bannerPct === null ? tpl(S.code_banner_mixed, { code: '' }).trim() : tpl(S.b_coupon_text, { percent: st.bannerPct })) + '</span></div>';
    }
    out += '</div><div class="bod-cart__body">';
    st.lines.forEach(function (l) {
      out += '<div class="bod-cart__line bod-cart__line--' + l.type + '" data-key="' + esc(l.key) + '">' + image(l, 72) +
        '<div class="bod-cart__line-main"><div class="bod-cart__line-title">' + esc(l.title) + '</div><div class="bod-cart__line-sub">' + esc(subtitle(st, l)) + '</div>' +
        (l.type === 'subscription' ? '<div class="bod-cart__renewal">' + esc(renewalText(st, l)) + '</div>' : '') + qtyLabel(st, l) + upsellRow(st, l) + '</div>' +
        '<div class="bod-cart__line-right">' + priceCells(st, l) + badge(st, l) + removeBtn(l) + '</div></div>';
    });
    out += protocolNudge(st) + codeField(st, 'b') + '</div>';
    out += '<div class="bod-cart__footer bod-cart__footer--b">' + termsBox(st) +
      checkoutForm(st, '<span>' + esc(S.checkout_text_b) + '</span><span>' + esc(st.money(st.total)) + '</span>', 'bod-cart__checkout--b') + trustIcons(st) + '</div>';
    return out;
  }

  /* ---------- design C: receipt breakdown ---------- */
  function renderC(st) {
    var S = st.S;
    var out = st.hasCode ? '<div class="bod-cart__topbar">' + esc(bannerText(st)) + '</div>' : '';
    out += header(st, false);
    if (st.empty) { return out + emptyState(st); }
    out += '<div class="bod-cart__body">';
    st.lines.forEach(function (l) {
      var title = l.type === 'subscription' ? l.title + ' · ' + l.plan.short : l.title;
      out += '<div class="bod-cart__line bod-cart__line--' + l.type + '" data-key="' + esc(l.key) + '">' + image(l, 64) +
        '<div class="bod-cart__line-main"><div class="bod-cart__line-title">' + esc(title) + '</div><div class="bod-cart__line-sub">' + esc(subtitle(st, l)) + '</div>' + qtyLabel(st, l) + upsellRow(st, l) + '</div>' +
        '<div class="bod-cart__line-right"><span class="bod-cart__price bod-cart__price--list">' + esc(st.money(l.list)) + '</span>' + removeBtn(l) + '</div></div>';
    });
    out += protocolNudge(st);
    out += '<div class="bod-cart__savings"><div class="bod-cart__savings-heading">' + esc(S.label_savings_heading) + '</div>';
    summaryRows(st).forEach(function (r) { out += summaryRowHtml(st, r, false); });
    if (st.freeShip) { out += '<div class="bod-cart__row"><span>' + esc(S.label_shipping) + '</span><span class="bod-cart__green">' + esc(S.free_label) + '</span></div>'; }
    if (st.saved > 0) { out += '<div class="bod-cart__saved-box"><span>' + esc(S.label_total_saved) + '</span><span class="bod-cart__saved-amount">' + esc(st.money(st.saved)) + '</span></div>'; }
    out += '</div>' + codeField(st, 'c') + '</div>';
    out += '<div class="bod-cart__footer bod-cart__footer--c"><div class="bod-cart__total"><span>' + esc(S.label_total) + '</span><span class="bod-cart__total-right">' +
      (st.saved > 0 ? '<span class="bod-cart__strike">' + esc(st.money(st.subtotal)) + '</span>' : '') + '<span class="bod-cart__total-amount">' + esc(st.money(st.total)) + '</span></span></div>';
    st.subs.forEach(function (l) { out += '<div class="bod-cart__renewal bod-cart__renewal--right">' + esc(renewalText(st, l)) + '</div>'; });
    out += termsBox(st) + checkoutForm(st, ICON.lock + '<span>' + esc(S.checkout_text_c) + '</span>', 'bod-cart__checkout--c') + '</div>';
    return out;
  }

  var RENDER = { a: renderA, b: renderB, c: renderC };

  /* ---------- render ---------- */
  function render() {
    var h = host(); if (!h) { return; }
    var data = readData(); if (!data) { return; }
    var root = h.querySelector('[data-bod-cart-root]'); if (!root) { return; }
    if (!chosen) { chosen = chooseDesign(data.settings && data.settings.design); }
    var st = buildState(data);
    h.setAttribute('data-design', chosen.design);
    root.innerHTML = RENDER[chosen.design](st);
    pending.error = null; pending.open = false; pending.code = '';
    writeSplitAttribute(st);
    enforceBundles(st);
    reconcileCodes(st, consumeCartJson());
    document.dispatchEvent(new CustomEvent('bod-cart:rendered', { detail: { design: chosen.design, state: st } }));
  }
  function writeSplitAttribute(st) {
    if (chosen.source !== 'split' || splitAttrWritten || st.empty) { return; }
    var current = st.cart.attributes && st.cart.attributes._cart_design;
    if (current === chosen.design) { return; }
    splitAttrWritten = true;
    post('cart/update.js', { attributes: { _cart_design: chosen.design } }).catch(function () {});
  }

  /* ---------- cart requests ---------- */
  function post(path, body) {
    return fetch(rootUrl() + path, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(body)
    }).then(function (r) { return r.json().then(function (j) { j.__ok = r.ok; return j; }); });
  }
  function withSections(body) { body.sections = SECTIONS; body.sections_url = window.location.pathname; return body; }
  function getCart() { return fetch(rootUrl() + 'cart.js', { headers: { 'Accept': 'application/json' } }).then(function (r) { return r.json(); }); }
  /* the cart JSON a mutation returned, handed to the next render so the code
     reconcile can read discount_codes without another request */
  var lastCartJson = null;
  function consumeCartJson() { var c = lastCartJson; lastCartJson = null; return c; }
  function applySections(res) {
    if (res && res.discount_codes) { lastCartJson = res; }
    var sections = res && res.sections;
    if (!sections || !sections['cart-drawer']) { return refreshTruth(); }
    var h = host();
    if (h) {
      var frag = new DOMParser().parseFromString(sections['cart-drawer'], 'text/html').querySelector('.cart-drawer');
      if (frag) { h.innerHTML = frag.innerHTML; } /* observer -> render() */
    }
    if (sections['cart-bubble']) {
      var b = document.querySelector('.thb-item-count');
      var nb = new DOMParser().parseFromString(sections['cart-bubble'], 'text/html').querySelector('.thb-item-count');
      if (b && nb) { b.innerHTML = nb.innerHTML; }
    }
    return Promise.resolve();
  }
  function refreshTruth() {
    return fetch(rootUrl() + '?sections=' + SECTIONS.join(','))
      .then(function (r) { return r.json(); })
      .then(function (s) { return applySections({ sections: s }); })
      .catch(function () {});
  }
  function setBusy(el, on) {
    var h = host(); if (h) { h.classList.toggle('is-busy', !!on); }
    if (el) { el.classList.toggle('is-loading', !!on); el.querySelectorAll('button').forEach(function (b) { b.disabled = !!on; }); }
  }

  function removeLine(keyList) {
    var keys = String(keyList || '').split(',').filter(Boolean);
    if (!keys.length) { return; }
    setBusy(null, true);
    /* one atomic update by line position: every line of the row goes to 0 together,
       plus any other line that is the same variant + selling plan (a split bundle
       must never leave half of itself behind) */
    getCart().then(function (cart) {
      var items = cart.items || [];
      var sig = {};
      items.forEach(function (i) {
        if (keys.indexOf(i.key) >= 0 && i.selling_plan_allocation) { sig[i.variant_id + '|' + i.selling_plan_allocation.selling_plan.id] = true; }
      });
      var updates = items.map(function (i) {
        var mine = keys.indexOf(i.key) >= 0 || (i.selling_plan_allocation && sig[i.variant_id + '|' + i.selling_plan_allocation.selling_plan.id]);
        return mine ? 0 : i.quantity;
      });
      return post('cart/update.js', withSections({ updates: updates }));
    }).then(applySections).catch(refreshTruth).then(function () { setBusy(null, false); });
  }
  /* A bundle plan (e.g. the 3-Month Plan = 2 tubs) must never sit in the cart below
     its full quantity, whatever the cart page or an app did to it. */
  var bundleFixes = 0;
  function enforceBundles(st) {
    if (bundleFixes >= 3) { return; }
    var sizes = parseMap(st.S.bundle_plans);
    var byPlan = {};
    (st.cart.items || []).forEach(function (i) {
      var sp = i.selling_plan_allocation && i.selling_plan_allocation.selling_plan;
      if (!sp || !sizes[String(sp.id)]) { return; }
      var k = String(sp.id);
      byPlan[k] = byPlan[k] || { total: 0, first: null };
      byPlan[k].total += i.quantity;
      if (!byPlan[k].first) { byPlan[k].first = i; }
    });
    var fix = null;
    Object.keys(byPlan).forEach(function (k) {
      var want = parseInt(sizes[k], 10) || 0, have = byPlan[k].total;
      if (!fix && want > 0 && have > 0 && have < want) { fix = { key: byPlan[k].first.key, quantity: byPlan[k].first.quantity + (want - have) }; }
    });
    if (!fix) { return; }
    bundleFixes++;
    post('cart/change.js', withSections({ id: fix.key, quantity: fix.quantity })).then(applySections).catch(function () {});
  }
  function protocolVariantId(data) {
    var S = withDefaults(data.settings || {});
    return parseInt(S.protocol_variant, 10) || (data.protocol && data.protocol.variant_id) || null;
  }
  function addProtocol() {
    var data = readData(); if (!data || !data.protocol) { return; }
    var vid = protocolVariantId(data); if (!vid) { return; }
    setBusy(null, true);
    post('cart/add.js', withSections({ items: [{ id: vid, quantity: 1, properties: { _gift: 'Free with your subscription' } }] }))
      .then(applySections).catch(refreshTruth).then(function () { setBusy(null, false); });
  }
  /* after a one-off becomes a subscription, bring the free protocol along if it isn't there */
  function maybeAddProtocol(items, fallback) {
    var data = readData();
    if (!data || !data.protocol || !(data.settings && data.settings.protocol_nudge)) { return Promise.resolve(fallback); }
    var ids = (data.protocol.variant_ids || []).map(String);
    var has = (items || []).some(function (i) { return ids.indexOf(String(i.variant_id)) >= 0; });
    if (has) { return Promise.resolve(fallback); }
    var vid = protocolVariantId(data); if (!vid) { return Promise.resolve(fallback); }
    return post('cart/add.js', withSections({ items: [{ id: vid, quantity: 1, properties: { _gift: 'Free with your subscription' } }] }))
      .then(function (r2) { return (r2 && r2.sections) ? r2 : fallback; })
      .catch(function () { return fallback; });
  }
  function swapLine(btn) {
    var key = btn.getAttribute('data-key'), plan = parseInt(btn.getAttribute('data-plan'), 10);
    var variant = btn.getAttribute('data-variant'), lineVariant = btn.getAttribute('data-line-variant');
    if (!key || !plan) { return; }
    setBusy(btn, true);
    var flow;
    if (!variant || variant === lineVariant) {
      flow = post('cart/change.js', withSections({ id: key, selling_plan: plan }))
        .then(function (res) { if (!res.__ok || res.status) { throw res; } return maybeAddProtocol(res.items, res); });
    } else {
      /* cross-variant swap: add the target first, then remove the one-off by its CURRENT key */
      var item = { id: parseInt(variant, 10), quantity: 1, selling_plan: plan, properties: { _li: Date.now().toString(36) } };
      flow = post('cart/add.js', { items: [item] })
        .then(function (r) { if (!r.__ok || r.status) { throw r; } return getCart(); })
        .then(function (cart) {
          var target = (cart.items || []).filter(function (i) { return i.key === key; })[0];
          if (!target) { return getCart().then(function (c2) { return maybeAddProtocol(c2.items, null); }); }
          return post('cart/change.js', withSections({ id: target.key, quantity: 0 }))
            .then(function (res) { return maybeAddProtocol(res.items, res); });
        });
    }
    flow.then(applySections).catch(function () { return refreshTruth(); }).then(function () { setBusy(null, false); });
  }

  /* Keep the real codes in step with the cart: every render, work out which family
     codes the lines qualify for and swap them in or out. Memory lives in the cart
     itself (an attached code names its family) or, while nothing qualifies, in
     localStorage. Only writes when the attached set would change. */
  var reconcile = { busy: false, count: 0, since: 0, first: true };
  function reconcileCodes(st, cartJson) {
    if (!st.rules.length || st.empty || reconcile.busy) { return; }
    var now = Date.now();
    if (now - reconcile.since > 15000) { reconcile.since = now; reconcile.count = 0; }
    if (reconcile.count >= 4) { return; }
    var held = ls.get(LS_CODE);
    var familyApplied = st.codes.some(function (c) { return !!aliasFor(st.rules, c); });
    var need = reconcile.first || !!held || familyApplied || !!(cartJson && cartJson.discount_codes);
    reconcile.first = false;
    if (!need) { return; }
    function settle(cart) {
      var attached = (cart.discount_codes || []).map(function (c) { return String(c.code); });
      var alias = null;
      attached.forEach(function (c) { if (!alias) { alias = aliasFor(st.rules, c); } });
      if (!alias && held) { alias = aliasFor(st.rules, held); }
      if (!alias) { return; }
      var fam = familyCodes(st.rules, alias).map(lower);
      var keep = attached.filter(function (c) { return fam.indexOf(lower(c)) < 0; });
      var want = desiredCodes(st.rules, alias, st.lines);
      var target = keep.concat(want);
      function remember() { if (want.length) { ls.remove(LS_CODE); } else { ls.set(LS_CODE, alias); } }
      if (sameCodes(target, attached)) { remember(); return; }
      reconcile.busy = true; reconcile.count++;
      post('cart/update.js', withSections({ discount: target.join(',') }))
        .then(function (res) {
          /* the family wins over a code it can't combine with (e.g. an order-level
             code attached earlier): retry with the family alone */
          var allOk = want.every(function (w) { return codeApplicable(res, w); });
          if (!allOk && want.length && keep.length) {
            return post('cart/update.js', withSections({ discount: want.join(',') })).then(function (res2) { remember(); return applySections(res2); });
          }
          remember(); return applySections(res);
        })
        .catch(refreshTruth)
        .then(function () { reconcile.busy = false; });
    }
    if (cartJson && cartJson.discount_codes) { settle(cartJson); } else { getCart().then(settle).catch(function () {}); }
  }

  function applyCode(form) {
    var input = form.querySelector('input[name="discount"]');
    var code = (input && input.value || '').trim();
    if (!code) { return; }
    var data = readData(); var S = withDefaults((data && data.settings) || {});
    var st = data ? buildState(data) : null;
    var alias = st ? aliasFor(st.rules, code) : null;
    function tryCodes(list) { return post('cart/update.js', withSections({ discount: list.join(',') })); }
    var applicable = codeApplicable;
    function ok(res) { return applicable(res, code); }
    function done(res) { pending.error = null; pending.open = false; pending.code = ''; return applySections(res); }
    function fail(res) { pending.error = S.invalid_code_text || "That code isn't valid."; pending.open = true; pending.code = code; return applySections(res); }
    if (alias) {
      var want = desiredCodes(st.rules, alias, st.lines);
      var fam = familyCodes(st.rules, alias).map(lower);
      if (!want.length) {
        /* nothing in the cart qualifies yet: hold the code and say so */
        ls.set(LS_CODE, alias);
        pending.error = null; pending.open = true; pending.code = '';
        render();
        return;
      }
      setBusy(form, true);
      getCart().then(function (cart) {
        var existing = (cart.discount_codes || []).filter(function (c) { return c.applicable && fam.indexOf(lower(c.code)) < 0; }).map(function (c) { return c.code; });
        function all(res) { return want.every(function (w) { return applicable(res, w); }); }
        return tryCodes(existing.concat(want)).then(function (res) {
          if (all(res)) { ls.remove(LS_CODE); return done(res); }
          /* the typed family wins over a code it can't combine with: try it alone */
          var alone = existing.length ? tryCodes(want) : Promise.resolve(res);
          return alone.then(function (res2) {
            if (all(res2)) { ls.remove(LS_CODE); return done(res2); }
            return tryCodes(existing).then(fail, fail);
          });
        });
      }).catch(function () { pending.error = S.invalid_code_text || "That code isn't valid."; pending.open = true; pending.code = code; return refreshTruth(); })
        .then(function () { setBusy(null, false); });
      return;
    }
    setBusy(form, true);
    getCart().then(function (cart) {
      var existing = (cart.discount_codes || []).filter(function (c) { return c.applicable && String(c.code).toLowerCase() !== code.toLowerCase(); }).map(function (c) { return c.code; });
      /* keep codes that already apply and add the new one on top; if they don't
         combine, try the new code on its own; otherwise put things back and say so */
      return tryCodes(existing.concat([code])).then(function (res) {
        if (ok(res)) { return done(res); }
        var tryAlone = existing.length ? tryCodes([code]) : Promise.resolve(res);
        return tryAlone.then(function (res2) {
          if (ok(res2)) { return done(res2); }
          /* put the cart back exactly as it was; this also detaches the rejected
             code so checkout doesn't show its own 'code isn't valid' error */
          return tryCodes(existing).then(fail, fail);
        });
      });
    }).catch(function () { pending.error = S.invalid_code_text || "That code isn't valid."; pending.open = true; pending.code = code; return refreshTruth(); })
      .then(function () { setBusy(null, false); });
  }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var h = host(); if (!h || !h.contains(e.target)) { return; }
    var el = e.target.closest('[data-bod-action]'); if (!el) { return; }
    var action = el.getAttribute('data-bod-action');
    e.preventDefault();
    if (action === 'remove') { removeLine(el.getAttribute('data-key')); }
    else if (action === 'swap') { swapLine(el); }
    else if (action === 'add-protocol') { addProtocol(); }
    else if (action === 'toggle-code') {
      var wrap = document.getElementById('BodCartCodeWrap');
      if (wrap) { wrap.hidden = false; el.setAttribute('aria-expanded', 'true'); el.hidden = true; var inp = wrap.querySelector('input'); if (inp) { inp.focus(); } }
    }
    else if (action === 'change-code') {
      var form = el.closest('form[data-bod-code]'); if (!form) { return; }
      var input = form.querySelector('input[name="discount"]');
      form.classList.remove('is-applied');
      input.readOnly = false; input.value = ''; input.focus();
      var applied = form.querySelector('.bod-cart__code-applied'); if (applied) { applied.remove(); }
      var data = readData(); var label = withDefaults((data && data.settings) || {}).code_apply_label;
      el.outerHTML = '<button type="submit" class="bod-cart__btn bod-cart__code-apply">' + esc(label) + '</button>';
    }
  }, true);

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (form.matches && form.matches('form[data-bod-code]')) { e.preventDefault(); applyCode(form); return; }
    if (form.matches && form.matches('form[data-bod-checkout]')) {
      var terms = document.getElementById('CartDrawerTerms');
      if (terms && !terms.checked) {
        var data = readData();
        terms.setCustomValidity((data && data.settings && data.settings.terms_required_text) || 'Please agree to the terms');
        terms.reportValidity(); terms.focus(); e.preventDefault();
      } else if (terms) { terms.setCustomValidity(''); }
    }
  }, true);
  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'CartDrawerTerms') { e.target.setCustomValidity(''); }
  });

  /* ---------- boot ---------- */
  function boot() {
    var h = host(); if (!h) { return; }
    handleUrlOverride();
    render();
    if (window.MutationObserver) {
      var t = null;
      new MutationObserver(function () {
        clearTimeout(t); t = setTimeout(render, 0);
      }).observe(h, { childList: true });
    }
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})();
