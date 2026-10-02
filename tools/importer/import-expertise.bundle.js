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

  // tools/importer/import-expertise.js
  var import_expertise_exports = {};
  __export(import_expertise_exports, {
    default: () => import_expertise_default
  });

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document: document2 }) {
    const bgImg = element.querySelector(".big-hero-image img, img.hero-background, picture img");
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
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-subnav.js
  function linkText(a) {
    const clone = a.cloneNode(true);
    clone.querySelectorAll("div, button, img, span, svg").forEach((n) => n.remove());
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function makeLink(document2, a) {
    const text = linkText(a);
    if (!text) return null;
    const link = document2.createElement("a");
    link.href = a.getAttribute("href") || a.href || "";
    link.textContent = text;
    return link;
  }
  function parse2(element, { document: document2 }) {
    let items = [...element.querySelectorAll("li.horizontal-navigation__link")];
    if (!items.length) items = [...element.querySelectorAll("ul.bah-navigation__link-container > li")];
    const list = document2.createElement("ul");
    items.forEach((li) => {
      const topAnchor = li.querySelector("a.horizontal-navigation__link-anchor") || li.querySelector("a:not(.horizontal-navigation__item-submenu-link)");
      const subAnchors = [...li.querySelectorAll(
        ".horizontal-navigation__sub-links a, a.horizontal-navigation__item-submenu-link"
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
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-subnav", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-video.js
  function textContentOf(column) {
    const matches = [...column.querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol, picture, img")];
    return matches.filter((el) => !matches.some((o) => o !== el && o.contains(el))).filter((el) => el.querySelector("img, picture") || el.matches("img, picture") || el.textContent.trim());
  }
  function parse3(element, { document: document2 }) {
    let columns = [...element.querySelectorAll(":scope > .column-bah > .columns, :scope > .row > .columns")].filter((c, i, arr) => arr.indexOf(c) === i);
    if (!columns.length) columns = [...element.querySelectorAll('.columns[class*="large-"]')];
    const videoColumn = columns.find((c) => c.querySelector(".video, iframe, .reveal_box"));
    const textColumns = columns.filter((c) => c !== videoColumn);
    const textCells = textColumns.map((col) => textContentOf(col)).filter((cell) => cell.length);
    const videoCell = [];
    if (videoColumn) {
      const iframe = videoColumn.querySelector('.embed-vbrick iframe, iframe[src*="vbrick"], iframe[src]');
      const src = iframe && iframe.getAttribute("src");
      if (src) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = src;
        a.textContent = src;
        p.append(a);
        videoCell.push(p);
      }
      const label = videoColumn.querySelector(".reveal-box-title");
      if (label && label.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = label.textContent.trim();
        videoCell.push(p);
      }
      const transcript = [...videoColumn.querySelectorAll(".reveal-box-content p, .reveal-box-content ul, .reveal-box-content ol")].filter((el, i, arr) => !arr.some((o) => o !== el && o.contains(el))).filter((el) => el.textContent.trim());
      videoCell.push(...transcript);
    }
    if (!textCells.length && !videoCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const row = [];
    columns.forEach((col) => {
      if (col === videoColumn) {
        if (videoCell.length) row.push(videoCell);
      } else {
        const cell = textContentOf(col);
        if (cell.length) row.push(cell);
      }
    });
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-carousel.js
  function ownText(el) {
    if (!el) return "";
    const clone = el.cloneNode(true);
    clone.querySelectorAll('img, svg, [class*="icon"]').forEach((n) => n.remove());
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function parse4(element, { document: document2 }) {
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

  // tools/importer/parsers/columns-backdrop.js
  function collectContent(column) {
    const matches = [...column.querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol, a.button")];
    return matches.filter((el) => !matches.some((o) => o !== el && o.contains(el))).filter((el) => el.textContent.trim());
  }
  function parse5(element, { document: document2 }) {
    const bgImg = element.querySelector(".grid-layout__background .background-image img") || element.querySelector(".grid-layout__background picture img") || element.querySelector('.grid-layout__background img:not([src^="data:"])');
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
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-backdrop", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-ruled.js
  var CONSUMED = "data-excat-consumed";
  var SEPARATOR = ".rule, .spacer";
  function columnsOf(row) {
    let cols = [...row.querySelectorAll(":scope > .column-bah > .columns, :scope > .row > .columns")];
    if (!cols.length) cols = [...row.querySelectorAll('.columns[class*="large-"]')];
    return cols.filter((c, i, arr) => arr.indexOf(c) === i);
  }
  function normalize(el) {
    el.querySelectorAll("span").forEach((span) => span.replaceWith(...span.childNodes));
    el.querySelectorAll("strong, b").forEach((strong) => {
      let last = strong.lastChild;
      while (last && last.nodeType === 3 && !last.textContent.trim()) last = last.previousSibling;
      if (last && last.nodeName === "BR") strong.after(last);
    });
    return el;
  }
  function cellContent(column) {
    const matches = [...column.querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol")];
    return matches.filter((el) => !matches.some((o) => o !== el && o.contains(el))).filter((el) => el.textContent.trim()).map(normalize);
  }
  function parse6(element, { document: document2 }) {
    if (element.hasAttribute(CONSUMED) || !element.parentNode) return;
    const rows = [element];
    const separators = [];
    let pending = [];
    let next = element.nextElementSibling;
    while (next) {
      if (next.matches(".column_bah")) {
        rows.push(next);
        separators.push(...pending);
        pending = [];
      } else if (next.matches(SEPARATOR)) {
        pending.push(next);
      } else {
        break;
      }
      next = next.nextElementSibling;
    }
    const cells = [];
    let width = 0;
    rows.forEach((row) => {
      const cols = columnsOf(row).map((col) => cellContent(col));
      if (!cols.some((c) => c.length)) return;
      cells.push(cols);
      width = Math.max(width, cols.length);
    });
    cells.forEach((r) => {
      while (r.length < width) r.push("");
    });
    cells.forEach((r, i) => {
      cells[i] = r.map((c) => Array.isArray(c) && !c.length ? "" : c);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    rows.slice(1).forEach((row) => {
      row.setAttribute(CONSUMED, "true");
      row.remove();
    });
    separators.forEach((sep) => sep.remove());
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-ruled", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-stats.js
  var CONSUMED2 = "data-excat-consumed";
  var SEPARATOR2 = ".rule, .spacer";
  function columnsOf2(row) {
    let cols = [...row.querySelectorAll(":scope > .column-bah > .columns, :scope > .row > .columns")];
    if (!cols.length) cols = [...row.querySelectorAll('.columns[class*="large-"]')];
    return cols.filter((c, i, arr) => arr.indexOf(c) === i);
  }
  function normalize2(el) {
    el.querySelectorAll("span").forEach((span) => span.replaceWith(...span.childNodes));
    [...el.querySelectorAll("strong, b")].forEach((strong) => {
      if (strong.querySelector("strong, b")) strong.replaceWith(...strong.childNodes);
    });
    return el;
  }
  function cellContent2(column) {
    const matches = [...column.querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol")];
    return matches.filter((el) => !matches.some((o) => o !== el && o.contains(el))).filter((el) => el.textContent.trim()).map(normalize2);
  }
  function parse7(element, { document: document2 }) {
    if (element.hasAttribute(CONSUMED2) || !element.parentNode) return;
    const rows = [element];
    const separators = [];
    let pending = [];
    let next = element.nextElementSibling;
    while (next) {
      if (next.matches(".column_bah")) {
        rows.push(next);
        separators.push(...pending);
        pending = [];
      } else if (next.matches(SEPARATOR2)) {
        pending.push(next);
      } else {
        break;
      }
      next = next.nextElementSibling;
    }
    const cells = [];
    let width = 0;
    rows.forEach((row) => {
      const cols = columnsOf2(row).map((col) => cellContent2(col));
      if (!cols.some((c) => c.length)) return;
      cells.push(cols);
      width = Math.max(width, cols.length);
    });
    cells.forEach((r) => {
      while (r.length < width) r.push("");
    });
    cells.forEach((r, i) => {
      cells[i] = r.map((c) => Array.isArray(c) && !c.length ? "" : c);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    rows.slice(1).forEach((row) => {
      row.setAttribute(CONSUMED2, "true");
      row.remove();
    });
    separators.forEach((sep) => sep.remove());
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-stats", cells });
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
        const wrapper = element.ownerDocument.createElement(a.classList.contains("default-style") ? "em" : "strong");
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

  // tools/importer/import-expertise.js
  var parsers = {
    "hero-banner": parse,
    "columns-subnav": parse2,
    "columns-video": parse3,
    "cards-carousel": parse4,
    "columns-backdrop": parse5,
    "columns-ruled": parse6,
    "columns-stats": parse7
  };
  var PAGE_TEMPLATE = {
    "name": "expertise",
    "description": "Expertise/capability landing page (big hero + content sections)",
    "urls": [
      "https://www.boozallen.com/expertise/artificial-intelligence.html"
    ],
    "blocks": [
      {
        "name": "hero-banner",
        "instances": [
          ".big-hero"
        ]
      },
      {
        "name": "columns-subnav",
        "instances": [
          ".horizontal-navigation"
        ]
      },
      {
        "name": "columns-video",
        "instances": [
          ".aem-Grid:has(> .big_hero) > :nth-child(3) .column_bah"
        ]
      },
      {
        "name": "cards-carousel",
        "instances": [
          ".card_carousel"
        ]
      },
      {
        "name": "columns-backdrop",
        "instances": [
          ".aem-Grid:has(> .big_hero) > .grid-layout__wrapper > .grid-layout"
        ]
      },
      {
        "name": "columns-ruled",
        "instances": [
          ".aem-Grid:has(> .big_hero) > :nth-child(6) .column_bah"
        ]
      },
      {
        "name": "columns-stats",
        "instances": [
          ".aem-Grid:has(> .big_hero) > :nth-child(9) .column_bah"
        ]
      }
    ],
    "sections": [
      {
        "id": "rc1",
        "name": "Page hero",
        "selector": [
          ".aem-Grid:has(> .big_hero) > .big_hero",
          "body > div:nth-of-type(2) .responsivegrid > .aem-Grid > :nth-child(1)"
        ],
        "style": null,
        "blocks": [
          "hero-banner"
        ],
        "defaultContent": []
      },
      {
        "id": "rc2",
        "name": "AI section sub-navigation",
        "selector": [
          ".aem-Grid:has(> .big_hero) > .horizontal-navigation__wrapper",
          "body > div:nth-of-type(2) .responsivegrid > .aem-Grid > :nth-child(2)"
        ],
        "style": null,
        "blocks": [
          "columns-subnav"
        ],
        "defaultContent": []
      },
      {
        "id": "rc3",
        "name": "AI with Real Impact (intro + video)",
        "selector": [
          ".aem-Grid:has(> .big_hero) > :nth-child(3)",
          "body > div:nth-of-type(2) .responsivegrid > .aem-Grid > :nth-child(3)"
        ],
        "style": null,
        "blocks": [
          "columns-video"
        ],
        "defaultContent": []
      },
      {
        "id": "rc4",
        "name": "Featured Capabilities",
        "selector": [
          ".aem-Grid:has(> .big_hero) > :nth-child(4)",
          "body > div:nth-of-type(2) .responsivegrid > .aem-Grid > :nth-child(4)"
        ],
        "style": "dark-gray",
        "blocks": [
          "cards-carousel"
        ],
        "defaultContent": [
          ".aem-Grid:has(> .big_hero) > :nth-child(4) .column_bah h5",
          ".aem-Grid:has(> .big_hero) > :nth-child(4) .column_bah h2"
        ]
      },
      {
        "id": "rc5",
        "name": "End-to-End Services (image backdrop, text left)",
        "selector": [
          ".aem-Grid:has(> .big_hero) > :nth-child(5)",
          "body > div:nth-of-type(2) .responsivegrid > .aem-Grid > :nth-child(5)"
        ],
        "style": null,
        "blocks": [
          "columns-backdrop"
        ],
        "defaultContent": []
      },
      {
        "id": "rc6",
        "name": "Our Services Include",
        "selector": [
          ".aem-Grid:has(> .big_hero) > :nth-child(6)",
          "body > div:nth-of-type(2) .responsivegrid > .aem-Grid > :nth-child(6)"
        ],
        "style": null,
        "blocks": [
          "columns-ruled"
        ],
        "defaultContent": [
          ".aem-Grid:has(> .big_hero) > :nth-child(6) .title h3",
          ".aem-Grid:has(> .big_hero) > :nth-child(6) .button_bah a"
        ]
      },
      {
        "id": "rc7",
        "name": "Our Latest Thinking (insights slider)",
        "selector": [
          ".aem-Grid:has(> .big_hero) > :nth-child(7)",
          "body > div:nth-of-type(2) .responsivegrid > .aem-Grid > :nth-child(7)"
        ],
        "style": "light",
        "blocks": [
          "cards-carousel"
        ],
        "defaultContent": [
          ".aem-Grid:has(> .big_hero) > :nth-child(7) .title h5",
          ".aem-Grid:has(> .big_hero) > :nth-child(7) .title h2",
          ".aem-Grid:has(> .big_hero) > :nth-child(7) .button_bah a"
        ]
      },
      {
        "id": "rc8",
        "name": "Real People, Making a Real Impact (image backdrop, text right)",
        "selector": [
          ".aem-Grid:has(> .big_hero) > :nth-child(8)",
          "body > div:nth-of-type(2) .responsivegrid > .aem-Grid > :nth-child(8)"
        ],
        "style": null,
        "blocks": [
          "columns-backdrop"
        ],
        "defaultContent": []
      },
      {
        "id": "rc9",
        "name": "AI by the numbers (stats)",
        "selector": [
          ".aem-Grid:has(> .big_hero) > :nth-child(9)",
          "body > div:nth-of-type(2) .responsivegrid > .aem-Grid > :nth-child(9)"
        ],
        "style": null,
        "blocks": [
          "columns-stats"
        ],
        "defaultContent": [
          ".aem-Grid:has(> .big_hero) > :nth-child(9) .button_bah a"
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
  var import_expertise_default = {
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
  return __toCommonJS(import_expertise_exports);
})();
