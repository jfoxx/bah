/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-defense.js
  var import_defense_exports = {};
  __export(import_defense_exports, {
    default: () => import_defense_default
  });

  // tools/importer/parsers/hero-banner.js
  var SITE_ORIGIN = "https://www.boozallen.com";
  function imageFromBackground(el, document2) {
    if (!el) return null;
    let value = el.style && el.style.backgroundImage || "";
    if (!/url\(/.test(value)) {
      const raw = el.getAttribute("style") || "";
      const m = raw.match(/background(?:-image)?\s*:[^;]*url\([^)]*\)/i);
      if (m) value = m[0].replace(/\\([0-9a-f]{1,6})\s?/gi, (s, hex) => String.fromCodePoint(parseInt(hex, 16)));
    }
    if (!/url\(/.test(value) && document2.defaultView && document2.defaultView.getComputedStyle) {
      value = document2.defaultView.getComputedStyle(el).backgroundImage || "";
    }
    const url = (value.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/) || [])[1];
    if (!url || url.startsWith("data:")) return null;
    let src;
    try {
      src = new URL(url.trim(), SITE_ORIGIN).href;
    } catch (e) {
      return null;
    }
    const img = document2.createElement("img");
    img.src = src;
    return img;
  }
  function parse(element, { document: document2 }) {
    const isOverviewHero = element.classList.contains("overview-hero-wrapper") || !!element.querySelector(".overview-hero-data");
    const isLight = isOverviewHero || !!element.querySelector("h1.title--black");
    const bgImg = element.querySelector(".big-hero-image img, img.hero-background, picture img") || element.querySelector(".overview-hero-background img") || (isOverviewHero ? imageFromBackground(element.querySelector(".overview-hero-background"), document2) : null);
    const heading = element.querySelector('h1, h2, [class*="big-hero__title"]');
    const paragraphs = [...element.querySelectorAll(
      '.big-hero__content-text p, .big-hero__content-stacked > p, [class*="emphasis-text"]'
    )].filter((p, i, arr) => arr.indexOf(p) === i && p.textContent.trim() && !arr.some((o) => o !== p && o.contains(p)));
    const ctas = [...element.querySelectorAll(".big-hero__cta a, .button-wrapper a")].filter((a, i, arr) => arr.indexOf(a) === i);
    if (!heading && !paragraphs.length && !bgImg) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImg) cells.push([bgImg]);
    const contentCell = [];
    if (heading) contentCell.push(heading);
    contentCell.push(...paragraphs);
    contentCell.push(...ctas);
    if (contentCell.length) cells.push([contentCell]);
    const variants = isLight ? ["light"] : [];
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-banner", variants, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-subnav.js
  var SPAN_TEXT = ".in-page-horizontal-nav__nav-item-text, .in-page-horizontal-nav-item__submenu-list-item-text";
  function linkText(a) {
    const clone = a.cloneNode(true);
    clone.querySelectorAll("div, button, img, span, svg").forEach((n) => n.remove());
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function makeLink(document2, a) {
    let text = linkText(a);
    if (!text) {
      const label = a.querySelector(SPAN_TEXT);
      text = label ? label.textContent.replace(/\s+/g, " ").trim() : "";
    }
    if (!text) return null;
    const link = document2.createElement("a");
    link.href = a.getAttribute("href") || a.href || "";
    link.textContent = text;
    return link;
  }
  function parse2(element, { document: document2 }) {
    let items = [...element.querySelectorAll("li.horizontal-navigation__link")];
    if (!items.length) items = [...element.querySelectorAll("ul.bah-navigation__link-container > li")];
    if (!items.length) items = [...element.querySelectorAll("ul.in-page-horizontal-nav__linkList > li")];
    const list = document2.createElement("ul");
    items.forEach((li) => {
      const topAnchor = li.querySelector("a.horizontal-navigation__link-anchor") || li.querySelector(":scope > a.in-page-horizontal-nav__nav-item") || li.querySelector("a:not(.horizontal-navigation__item-submenu-link)");
      const subAnchors = [...li.querySelectorAll(
        ".horizontal-navigation__sub-links a, a.horizontal-navigation__item-submenu-link, .in-page-horizontal-nav-item__mobile-submenu a"
      )].filter((a, i, arr) => arr.indexOf(a) === i);
      const topLink = topAnchor ? makeLink(document2, topAnchor) : null;
      if (!topLink && !subAnchors.length) return;
      const item = document2.createElement("li");
      if (topLink) item.append(topLink);
      const subLinks = subAnchors.map((a) => makeLink(document2, a)).filter(Boolean);
      if (subLinks.length) {
        const subList = document2.createElement("ul");
        subLinks.forEach((link) => {
          const subItem = document2.createElement("li");
          subItem.append(link);
          subList.append(subItem);
        });
        item.append(subList);
      }
      list.append(item);
    });
    let ctas = [...element.querySelectorAll(".horizontal-navigation__cta-buttons-container a")];
    if (!ctas.length) {
      const seen = /* @__PURE__ */ new Set();
      ctas = [...element.querySelectorAll(".cta-items a, .cta-group a, a.in-page-horizontal-nav__cta")].filter((a) => {
        const key = `${a.getAttribute("href")}|${a.textContent.replace(/\s+/g, " ").trim()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      ctas.forEach((a) => {
        a.textContent = a.textContent.replace(/\s+/g, " ").trim();
      });
    }
    if (!ctas.length) ctas = [...element.querySelectorAll(".button-wrapper a, a.button")];
    const ctaCell = ctas.filter((a) => a.textContent.trim()).map((a) => {
      const p = document2.createElement("p");
      p.append(a);
      return p;
    });
    if (!list.children.length && !ctaCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[list.children.length ? list : "", ctaCell.length ? ctaCell : ""]];
    const inPage = element.matches(".in-page-horizontal-nav") || !!element.querySelector(".in-page-horizontal-nav__linkList");
    const variants = inPage ? ["in-page"] : [];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-subnav", variants, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-carousel.js
  function ownText(el) {
    if (!el) return "";
    const clone = el.cloneNode(true);
    clone.querySelectorAll('img, svg, [class*="icon"]').forEach((n) => n.remove());
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function parse3(element, { document: document2 }) {
    let cards = [...element.querySelectorAll(".card_generic")];
    if (!cards.length) cards = [...element.querySelectorAll(".card-generic__component")];
    if (!cards.length) cards = [...element.querySelectorAll(".swiper-slide")];
    const cells = [];
    cards.forEach((card) => {
      const title = ownText(card.querySelector(".card-generic__title"));
      const body = ownText(card.querySelector(".card-generic__body"));
      const linkEl = card.querySelector("a.card-generic__linkContainer") || card.querySelector("a[href]");
      const href = linkEl ? linkEl.getAttribute("href") : "";
      const ctaText = ownText(card.querySelector(".card-generic__cta-text, .card-generic__cta")) || "Learn More";
      const img = card.querySelector("img.card-generic__image") || card.querySelector('.card-generic__image-container img:not([src^="data:"])');
      if (!title && !body && !img) return;
      const textCell = [];
      if (title) {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        strong.textContent = title;
        p.append(strong);
        textCell.push(p);
      }
      if (body) {
        const p = document2.createElement("p");
        p.textContent = body;
        textCell.push(p);
      }
      if (href) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = ctaText;
        p.append(a);
        textCell.push(p);
      }
      if (img) cells.push([img, textCell]);
      else cells.push([textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-horizontal.js
  function clean(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function parse4(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".dynamic-content-item")];
    if (!items.length) items = [...element.querySelectorAll(".card")];
    const cells = [];
    items.forEach((item) => {
      const linkEl = item.querySelector("a.manual-path") || item.querySelector("a[href]:not(.content-type):not(.large-content-type)");
      const titleEl = item.querySelector(".card-content .title, .card-content .article-title") || item.querySelector(".article-title:not(.large-title)");
      const title = clean(titleEl ? titleEl.textContent : "");
      const img = item.querySelector(".dynamic-article-image-container img") || item.querySelector('img:not([src^="data:"])');
      const tagEl = item.querySelector(".card-meta .content-type, a.content-type") || item.querySelector(".large-content-type");
      const tag = clean(tagEl ? tagEl.textContent : "");
      if (!title && !img) return;
      const body = [];
      if (title) {
        const p = document2.createElement("p");
        const href = linkEl ? linkEl.getAttribute("href") : "";
        if (href) {
          const a = document2.createElement("a");
          a.href = href;
          a.textContent = title;
          p.append(a);
        } else {
          p.textContent = title;
        }
        body.push(p);
      }
      if (tag) {
        const p = document2.createElement("p");
        p.textContent = tag;
        body.push(p);
      }
      cells.push([img || "", body]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-horizontal", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-backdrop.js
  var SITE_ORIGIN2 = "https://www.boozallen.com";
  function imageFromBackground2(el, document2) {
    if (!el) return null;
    let value = el.style && el.style.backgroundImage || "";
    if (!/url\(/.test(value)) {
      const raw = el.getAttribute("style") || "";
      const m = raw.match(/background(?:-image)?\s*:[^;]*url\([^)]*\)/i);
      if (m) value = m[0].replace(/\\([0-9a-f]{1,6})\s?/gi, (s, hex) => String.fromCodePoint(parseInt(hex, 16)));
    }
    if (!/url\(/.test(value) && document2.defaultView && document2.defaultView.getComputedStyle) {
      value = document2.defaultView.getComputedStyle(el).backgroundImage || "";
    }
    const url = (value.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/) || [])[1];
    if (!url || url.startsWith("data:")) return null;
    let src;
    try {
      src = new URL(url.trim(), SITE_ORIGIN2).href;
    } catch (e) {
      return null;
    }
    const img = document2.createElement("img");
    img.src = src;
    return img;
  }
  function collectContent(column) {
    const matches = [...column.querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol, a.button")];
    return matches.filter((el) => !matches.some((o) => o !== el && o.contains(el))).filter((el) => el.textContent.trim());
  }
  function parse5(element, { document: document2 }) {
    const genericBlocks = [...element.querySelectorAll(".generic-block-image")];
    if (element.matches(".generic-block-image")) genericBlocks.unshift(element);
    const isGenericBlock = genericBlocks.length > 0;
    const isDark = isGenericBlock && genericBlocks.some((b) => b.classList.contains("black"));
    let bgImg = element.querySelector(".grid-layout__background .background-image img") || element.querySelector(".grid-layout__background picture img") || element.querySelector('.grid-layout__background img:not([src^="data:"])');
    if (!bgImg && isGenericBlock) {
      for (const b of genericBlocks) {
        bgImg = imageFromBackground2(b, document2);
        if (bgImg) break;
      }
    }
    let columns = [...element.querySelectorAll(".column-bah > .columns")];
    if (!columns.length) columns = [...element.querySelectorAll('.column_bah .columns[class*="large-"]')];
    const contents = columns.map((col) => collectContent(col));
    const textIdx = contents.findIndex((c) => c.length);
    if (textIdx < 0 && !bgImg) {
      element.replaceWith(...element.childNodes);
      return;
    }
    let row;
    if (textIdx < 0) {
      row = [bgImg];
    } else if (!bgImg) {
      row = [contents[textIdx]];
    } else {
      const emptyIdx = contents.findIndex((c) => !c.length);
      const imageFirst = emptyIdx >= 0 && emptyIdx < textIdx;
      row = imageFirst ? [bgImg, contents[textIdx]] : [contents[textIdx], bgImg];
    }
    const cells = [row];
    const variants = isDark ? ["dark"] : [];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-backdrop", variants, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed-marketo.js
  var DEFAULT_MUNCHKIN_ID = "516-JQG-021";
  var DEFAULT_BASE_URL = "https://pages.boozallen.com";
  function originOf(url) {
    try {
      return new URL(url, "https://www.boozallen.com").origin;
    } catch (e) {
      return "";
    }
  }
  function parse6(element, { document: document2 }) {
    const form = element.querySelector('form.mktoForm, form[id^="mktoForm_"]');
    const contentWrap = element.querySelector(".marketo-form__content");
    let formId = form ? form.getAttribute("data-form-id") || "" : "";
    if (!formId) {
      const idSource = [form, contentWrap, element.querySelector('[id^="thankYouXF-"]')].filter(Boolean).map((n) => n.id).join(" ");
      const m = idSource.match(/(?:mktoForm_|thankYouXF-)(\d+)/);
      if (m) [, formId] = m;
    }
    const munchkinId = form && form.getAttribute("data-munchkin-id") || DEFAULT_MUNCHKIN_ID;
    const scriptUrl = form && form.getAttribute("data-script-url");
    const baseUrl = scriptUrl && originOf(scriptUrl) || DEFAULT_BASE_URL;
    const lead = [];
    if (contentWrap) {
      const nodes = [...contentWrap.querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol")].filter((n) => !n.closest('form, [id^="thankYouXF-"], .cmp-experiencefragment--marketo-submit'));
      nodes.filter((n) => !nodes.some((o) => o !== n && o.contains(n))).filter((n) => n.textContent.trim()).forEach((n) => {
        if (/^H[1-6]$/.test(n.tagName)) {
          const h = document2.createElement(n.tagName.toLowerCase());
          h.textContent = n.textContent.replace(/\s+/g, " ").trim();
          lead.push(h);
        } else {
          lead.push(n);
        }
      });
    }
    if (!formId) {
      if (lead.length) element.replaceWith(...lead);
      else element.replaceWith(...element.childNodes);
      return;
    }
    const baseLink = document2.createElement("a");
    baseLink.href = baseUrl;
    baseLink.textContent = baseUrl;
    const cells = [
      ["Form ID", formId],
      ["Munchkin ID", munchkinId],
      ["Base URL", baseLink]
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "embed-marketo", cells });
    if (lead.length) element.before(...lead);
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-cta.js
  function parse7(element, { document: document2 }) {
    let columns = [...element.querySelectorAll(".column-bah > .columns")];
    if (!columns.length) columns = [...element.querySelectorAll('.columns[class*="large-"]')];
    if (!columns.length) columns = [element];
    const textContent = [];
    const ctas = [];
    columns.forEach((col) => {
      col.querySelectorAll("a.button, .button-wrapper a, .button_bah a").forEach((a) => {
        if (!ctas.includes(a) && a.textContent.trim()) ctas.push(a);
      });
      const nodes = [...col.querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol")].filter((n) => !n.closest(".button_bah, .button-wrapper"));
      nodes.filter((n) => !nodes.some((o) => o !== n && o.contains(n))).filter((n) => n.textContent.trim()).forEach((n) => textContent.push(n));
    });
    if (!textContent.length && !ctas.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const ctaCell = ctas.map((a) => {
      a.textContent = a.textContent.replace(/\s+/g, " ").trim();
      const p = document2.createElement("p");
      p.append(a);
      return p;
    });
    const cells = [[textContent.length ? textContent : "", ctaCell.length ? ctaCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-cta", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/boozallen-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        // <aside class="dg-consent-banner visible dg-right"> (DataGrail cookie consent)
        "aside.dg-consent-banner",
        // <iframe title="Adobe ID Syncing iFrame" id="destination_publishing_iframe_bah_0"> (tracking)
        "iframe#destination_publishing_iframe_bah_0",
        // <a href="#content" class="visually-hidden focusable skip-link">
        "a.skip-link",
        // Empty placeholder background videos (404 sources), incl. inside every expertise
        // card_carousel card: <div class="background-video"><video><source src="/download">
        // Sorry, your browser doesn't support embedded videos.</video></div>
        // Removed before parsing so the fallback text never leaks into block cells.
        // Real (Scene7) videos, e.g. the homepage hero, are untouched.
        '.background-video:has(source[src="/download"])'
      ]);
      element.querySelectorAll('img[src^="http"]').forEach((img) => {
        try {
          const { hostname } = new URL(img.getAttribute("src"));
          if (!/(^|\.)boozallen\.com$|(^|\.)scene7\.com$/.test(hostname)) img.remove();
        } catch (e) {
        }
      });
    }
    if (hookName === TransformHook.afterTransform) {
      element.querySelectorAll("a.button").forEach((a) => {
        if (a.closest("strong, em")) return;
        const teal = a.classList.contains("default-style") || a.classList.contains("button--primary-on-light") && !a.classList.contains("in-page-horizontal-nav__cta");
        const wrapper = element.ownerDocument.createElement(teal ? "em" : "strong");
        a.replaceWith(wrapper);
        wrapper.append(a);
      });
      WebImporter.DOMUtils.remove(element, [
        // <div class="site-header__container ..."> wraps <nav class="site-header bah-navigation ...">
        "div.site-header__container",
        // <noindex><footer class="footer-global" id="footer-global">
        "#footer-global",
        "noindex",
        // <div class="link-to-top"><a href="#"><span>Top</span>...</a></div>
        "div.link-to-top",
        // <h1 class="visuallyhidden">Booz Allen Hamilton</h1> - screen-reader-only site title, not page content
        "h1.visuallyhidden",
        // <h1 class="visuallyhidden">Artificial Intelligence Solutions</h1> on expertise pages
        // is the same element (SEO duplicate of the hero H1) - covered by 'h1.visuallyhidden' above.
        // Decorative section background patterns (home-pattern-*.png) - conveyed by section style
        // (pattern-waves / pattern-rings). Runs after parsers: on expertise pages the
        // columns-backdrop parser matches '.grid-layout__wrapper > .grid-layout', which contains
        // its .grid-layout__background image, so that image is already in the block by now.
        ".grid-layout__background",
        // Defense/market pages: desktop-only duplicate of the in-page nav submenus, sibling of
        // the columns-subnav source (#in-page-horizontal-nav) inside .in_page_horizontal_navigation:
        // <div class="in-page-submenu__container hide-for-small-only">
        "div.in-page-submenu__container",
        // Empty script-injected body-level helpers on defense pages:
        // <div id="bah-subnav-sentinel_in-page-horizontal-nav">, <div id="mktoStyleLoaded">,
        // and the empty Marketo XD form <form class="mktoForm ..."> directly under <body>
        // (the real form lives inside .marketo_form, handled by the embed-marketo parser)
        '[id^="bah-subnav-sentinel"]',
        "#mktoStyleLoaded",
        "body > form.mktoForm",
        // Remaining non-authorable embeds/tracking
        "iframe",
        "noscript",
        "link"
      ]);
    }
  }

  // tools/importer/transformers/boozallen-sections.js
  var MARKER_PREFIX = "excat-section:";
  var SHOW_COMMENT = 128;
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      let el = null;
      try {
        el = root.querySelector(sel);
      } catch (e) {
        el = null;
      }
      if (el) return el;
    }
    return null;
  }
  function findMarkers(root) {
    const doc = root.ownerDocument || document;
    const walker = doc.createTreeWalker(root, SHOW_COMMENT);
    const markers = {};
    let node = walker.nextNode();
    while (node) {
      const text = (node.nodeValue || "").trim();
      if (text.startsWith(MARKER_PREFIX)) markers[text.slice(MARKER_PREFIX.length)] = node;
      node = walker.nextNode();
    }
    return markers;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument || document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        sectionEl.before(doc.createComment(`${MARKER_PREFIX}${section.id}`));
      }
    }
    if (hookName === "afterTransform") {
      const markers = findMarkers(element);
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const marker = markers[section.id];
        let anchor = null;
        if (marker && marker.parentNode) {
          anchor = marker;
        } else {
          const sectionEl = querySection(element, section.selector);
          if (!sectionEl) continue;
          anchor = doc.createComment(`${MARKER_PREFIX}${section.id}`);
          sectionEl.before(anchor);
        }
        let insertAfter = anchor;
        if (i > 0) {
          const hr = doc.createElement("hr");
          anchor.after(hr);
          insertAfter = hr;
        }
        if (section.style) {
          const metadataBlock = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          insertAfter.after(metadataBlock);
        }
        anchor.remove();
      }
      Object.values(findMarkers(element)).forEach((c) => c.remove());
    }
  }

  // tools/importer/import-defense.js
  var parsers = {
    "hero-banner": parse,
    "columns-subnav": parse2,
    "cards-carousel": parse3,
    "cards-horizontal": parse4,
    "columns-backdrop": parse5,
    "embed-marketo": parse6,
    "columns-cta": parse7
  };
  var PAGE_TEMPLATE = {
    "name": "defense",
    "description": "Defense market/solution page (overview hero + in-page nav + content blocks)",
    "urls": [
      "https://www.boozallen.com/markets/defense/ai-for-military.html"
    ],
    "blocks": [
      {
        "name": "hero-banner",
        "instances": [
          "#content > div.overview-hero-wrapper.full"
        ]
      },
      {
        "name": "columns-subnav",
        "instances": [
          ".in-page-horizontal-nav"
        ]
      },
      {
        "name": "cards-carousel",
        "instances": [
          "body > div.overview-page-content.wide-parsys > div.generic_block.responsivegrid:nth-of-type(1) .card_carousel"
        ]
      },
      {
        "name": "cards-horizontal",
        "instances": [
          "body > div.overview-page-content.wide-parsys > div.generic_block.responsivegrid:nth-of-type(2) .dynamic-content-super-wrapper"
        ]
      },
      {
        "name": "columns-backdrop",
        "instances": [
          "body > div.overview-page-content.wide-parsys > div.generic_block.responsivegrid:nth-of-type(4) > div"
        ]
      },
      {
        "name": "embed-marketo",
        "instances": [
          "body > div.overview-page-content.wide-parsys > div.generic_block.responsivegrid:nth-of-type(6) .marketo_form"
        ]
      },
      {
        "name": "columns-cta",
        "instances": [
          "body > div.overview-page-content.wide-parsys > div.generic_block.responsivegrid:nth-of-type(7) .column_bah"
        ]
      }
    ],
    "sections": [
      {
        "id": "rc1",
        "name": "Overview hero",
        "selector": [
          "#content > div.overview-hero-wrapper.full"
        ],
        "style": null,
        "blocks": [
          "hero-banner"
        ],
        "defaultContent": []
      },
      {
        "id": "rc2",
        "name": "In-page sub-navigation",
        "selector": [
          "#in-page-horizontal-nav",
          ".in_page_horizontal_navigation"
        ],
        "style": null,
        "blocks": [
          "columns-subnav"
        ],
        "defaultContent": []
      },
      {
        "id": "rc3",
        "name": "Intro",
        "selector": [
          "body > div.sticky-sidebar-container"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          "body > div.sticky-sidebar-container h2",
          "body > div.sticky-sidebar-container .cmp-text p"
        ]
      },
      {
        "id": "rc4",
        "name": "Propel Your Defense AI Mission (card slider)",
        "selector": [
          "body > div.overview-page-content.wide-parsys > div.generic_block.responsivegrid:nth-of-type(1)"
        ],
        "style": "dark",
        "blocks": [
          "cards-carousel"
        ],
        "defaultContent": [
          "body > div.overview-page-content.wide-parsys > div.generic_block.responsivegrid:nth-of-type(1) .title h2"
        ]
      },
      {
        "id": "rc5",
        "name": "Case study teaser",
        "selector": [
          "body > div.overview-page-content.wide-parsys > div.generic_block.responsivegrid:nth-of-type(2)"
        ],
        "style": null,
        "blocks": [
          "cards-horizontal"
        ],
        "defaultContent": [
          "body > div.overview-page-content.wide-parsys > div.generic_block.responsivegrid:nth-of-type(2) h4"
        ]
      },
      {
        "id": "rc6",
        "name": "How does the military use AI",
        "selector": [
          "body > div.overview-page-content.wide-parsys > div.generic_block.responsivegrid:nth-of-type(3)"
        ],
        "style": "light",
        "blocks": [],
        "defaultContent": [
          "body > div.overview-page-content.wide-parsys > div.generic_block.responsivegrid:nth-of-type(3) h2",
          "body > div.overview-page-content.wide-parsys > div.generic_block.responsivegrid:nth-of-type(3) .cmp-text p",
          "body > div.overview-page-content.wide-parsys > div.generic_block.responsivegrid:nth-of-type(3) .cmp-text ul"
        ]
      },
      {
        "id": "rc7",
        "name": "Tactical Edge AI for JADC2 (dark photo band)",
        "selector": [
          "body > div.overview-page-content.wide-parsys > div.generic_block.responsivegrid:nth-of-type(4)"
        ],
        "style": null,
        "blocks": [
          "columns-backdrop"
        ],
        "defaultContent": []
      },
      {
        "id": "rc8",
        "name": "AI with Agency",
        "selector": [
          "body > div.overview-page-content.wide-parsys > div.grid-layout__wrapper"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          "body > div.overview-page-content.wide-parsys > div.grid-layout__wrapper h4",
          "body > div.overview-page-content.wide-parsys > div.grid-layout__wrapper .cmp-text p",
          "body > div.overview-page-content.wide-parsys > div.grid-layout__wrapper .button_bah a"
        ]
      },
      {
        "id": "rc9",
        "name": "Want More Information? (Marketo form)",
        "selector": [
          "body > div.overview-page-content.wide-parsys > div.generic_block.responsivegrid:nth-of-type(6)"
        ],
        "style": "dark",
        "blocks": [
          "embed-marketo"
        ],
        "defaultContent": [
          "body > div.overview-page-content.wide-parsys > div.generic_block.responsivegrid:nth-of-type(6) .marketo-form__content .title h3",
          "body > div.overview-page-content.wide-parsys > div.generic_block.responsivegrid:nth-of-type(6) .marketo-form__content > .aem-Grid > .text .cmp-text p"
        ]
      },
      {
        "id": "rc10",
        "name": "Join Booz Allen",
        "selector": [
          "body > div.overview-page-content.wide-parsys > div.generic_block.responsivegrid:nth-of-type(7)"
        ],
        "style": null,
        "blocks": [
          "columns-cta"
        ],
        "defaultContent": [
          "body > div.overview-page-content.wide-parsys > div.generic_block.responsivegrid:nth-of-type(7) .title h2"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_defense_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_defense_exports);
})();
