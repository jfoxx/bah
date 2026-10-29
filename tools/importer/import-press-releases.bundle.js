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

  // tools/importer/import-press-releases.js
  var import_press_releases_exports = {};
  __export(import_press_releases_exports, {
    default: () => import_press_releases_default
  });

  // tools/importer/parsers/hero-banner.js
  var SITE_ORIGIN = "https://www.boozallen.com";
  var NEWSROOM_ORIGIN = "https://newsroom.boozallen.com";
  function isNewsroomHero(element, document2) {
    if (element.querySelector(".region-banner-image, img.banner_img")) return true;
    const bg = element.querySelector(".overview-hero-background");
    const style = bg && bg.getAttribute("style") || "";
    if (/url\([^)]*(\/system\/files|\/sites\/g\/files|nasdaq_kms)/i.test(style)) return true;
    try {
      const host = document2.defaultView && document2.defaultView.location && document2.defaultView.location.hostname || "";
      return host === "newsroom.boozallen.com";
    } catch (e) {
      return false;
    }
  }
  function imageFromBackground(el, document2, origin = SITE_ORIGIN) {
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
      src = new URL(url.trim(), origin).href;
    } catch (e) {
      return null;
    }
    const img = document2.createElement("img");
    img.src = src;
    return img;
  }
  function parse(element, { document: document2 }) {
    const isOverviewHero = element.classList.contains("overview-hero-wrapper") || !!element.querySelector(".overview-hero-data");
    const isNewsroom = isOverviewHero && isNewsroomHero(element, document2);
    const isLight = isOverviewHero && !isNewsroom || !!element.querySelector("h1.title--black");
    let bgImg = element.querySelector(".big-hero-image img, img.hero-background, picture img") || element.querySelector(".overview-hero-background img") || (isOverviewHero ? imageFromBackground(
      element.querySelector(".overview-hero-background"),
      document2,
      isNewsroom ? NEWSROOM_ORIGIN : SITE_ORIGIN
    ) : null);
    if (isNewsroom && bgImg && bgImg.getAttribute("src") && /^\/(?!\/)/.test(bgImg.getAttribute("src"))) {
      const img = document2.createElement("img");
      img.src = new URL(bgImg.getAttribute("src"), NEWSROOM_ORIGIN).href;
      if (bgImg.getAttribute("alt")) img.alt = bgImg.getAttribute("alt");
      bgImg = img;
    }
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

  // tools/importer/parsers/cards-listing.js
  var INDEX_PATH = "/news-releases/query-index.json";
  var DEFAULT_TAG = "Press Release";
  var PAGE_SIZE = "10";
  function parse2(element, { document: document2 }) {
    const counts = {};
    element.querySelectorAll(".nir-widget--news--categories .field__item").forEach((el) => {
      const text = el.textContent.replace(/\s+/g, " ").trim();
      if (text) counts[text] = (counts[text] || 0) + 1;
    });
    const tag = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || DEFAULT_TAG;
    const link = document2.createElement("a");
    link.href = INDEX_PATH;
    link.textContent = INDEX_PATH;
    const cells = [
      [link],
      ["Tag", tag],
      ["Page Size", PAGE_SIZE]
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-listing", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/newsroom-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        // <aside class="dg-consent-banner visible dg-right"> (DataGrail cookie consent;
        // the only DataGrail element - the consent script is HTML comments only)
        "aside.dg-consent-banner",
        // <div id="skip"><a class="visually-hidden focusable skip-link" href="#lfg-main-content">
        "#skip",
        "a.skip-link",
        // Global header: <div id="block-client-site-202-pe-topnav" ...> wraps
        // <div class="site-header__container ..."><nav class="site-header bah-navigation ...">
        "#block-client-site-202-pe-topnav",
        // Global footer: <div id="block-client-site-202-pe-botnav"> > ... > <noindex>
        // <footer class="footer-global" id="footer-global">
        "#block-client-site-202-pe-botnav",
        "#footer-global",
        // Drupal body-level helpers: <div id="drupal-live-announce" class="visually-hidden">,
        // <div id="drupal-modal" class="ui-front">
        "#drupal-live-announce",
        "#drupal-modal"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Back-to-top link: <div class="link-to-top for-link-to-top"><a href="#"><span>Top</span>
        "div.link-to-top",
        // Empty Drupal region chrome around the listing:
        // <div class="region region-content" id="lfg-main-content"><div class="hidden">
        "#lfg-main-content > div.hidden",
        // <div id="block-client-site-202-websitenoticeblock" class="block--website-notice-block ...">
        "#block-client-site-202-websitenoticeblock",
        // Remaining non-authorable embeds / stylesheets
        // (<link href="https://www.boozallen.com/etc.clientlibs/...css"> at end of body)
        "noindex",
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

  // tools/importer/import-press-releases.js
  var parsers = {
    "hero-banner": parse,
    "cards-listing": parse2
  };
  var PAGE_TEMPLATE = {
    "name": "press-releases",
    "description": "Newsroom press release listing: image hero + dynamic query-index listing (year filter, list, pager)",
    "urls": [
      "https://newsroom.boozallen.com/press-releases"
    ],
    "blocks": [
      {
        "name": "hero-banner",
        "instances": [
          "#content > div.overview-hero-wrapper"
        ]
      },
      {
        "name": "cards-listing",
        "instances": [
          ".block-nir-news__widget"
        ]
      }
    ],
    "sections": [
      {
        "id": "rc1",
        "name": "Overview hero",
        "selector": [
          "#content > div.overview-hero-wrapper"
        ],
        "style": null,
        "blocks": [
          "hero-banner"
        ],
        "defaultContent": []
      },
      {
        "id": "rc2",
        "name": "Press release listing",
        "selector": [
          "#block-client-site-202-content",
          ".block-nir-news__widget"
        ],
        "style": null,
        "blocks": [
          "cards-listing"
        ],
        "defaultContent": []
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
  var import_press_releases_default = {
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
  return __toCommonJS(import_press_releases_exports);
})();
