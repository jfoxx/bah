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

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-video.js
  function parse(element, { document: document2 }) {
    const picture = element.querySelector(".background-image picture") || element.querySelector(".cyber-hero__background picture") || element.querySelector("picture:not(.cyber-hero__scroll-indicator picture)");
    let image = picture;
    if (!image) {
      image = [...element.querySelectorAll("img")].find((img) => !img.closest(".cyber-hero__scroll-indicator")) || null;
    }
    const sources = [...element.querySelectorAll("video source[src], video[src]")].map((s) => s.getAttribute("src")).filter((src) => src && src !== "/download");
    const videoSrc = sources.find((src) => !/\.m3u8(\?|$)/i.test(src)) || sources[0];
    const heading = element.querySelector(".cyber-hero__text h1, .cyber-hero__text h2, .cyber-hero__content h1, .cyber-hero__content h2");
    const texts = [...element.querySelectorAll(".cyber-hero__text p, .cyber-hero__content .cmp-text p")];
    if (!image && !videoSrc && !heading) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [];
    if (image) contentCell.push(image);
    if (videoSrc) {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = videoSrc;
      a.textContent = videoSrc;
      p.append(a);
      contentCell.push(p);
    }
    if (heading) contentCell.push(heading);
    contentCell.push(...texts);
    const cells = [[contentCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  var CONTENT_SELECTOR = "picture, img, video, h1, h2, h3, h4, h5, h6, p, ul, ol, a.button";
  function collectColumnContent(column) {
    const matches = [...column.querySelectorAll(CONTENT_SELECTOR)];
    return matches.filter((el) => !matches.some((other) => other !== el && other.contains(el))).filter((el) => {
      if (el.matches("picture, img, video")) return true;
      return el.textContent.trim().length > 0;
    });
  }
  function parse2(element, { document: document2 }) {
    let columns = [...element.querySelectorAll(":scope > .grid-layout__column")];
    if (!columns.length) columns = [...element.querySelectorAll(':scope > [class*="large-"]')];
    if (!columns.length) columns = [...element.children];
    const row = columns.map((col) => collectColumnContent(col)).filter((cell) => cell.length);
    if (!row.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-teaser.js
  function linkParagraph(document2, source) {
    const p = document2.createElement("p");
    const a = document2.createElement("a");
    a.href = source.getAttribute("href") || source.href || "";
    a.textContent = source.textContent.replace(/\s+/g, " ").trim();
    p.append(a);
    return p;
  }
  function parse3(element, { document: document2 }) {
    let cards = [...element.querySelectorAll(".horizontal-card-container__card")];
    if (!cards.length) cards = [...element.querySelectorAll(".swiper-slide__wrapper, .swiper-slide")];
    cards = cards.filter((card) => !card.closest(".swiper-slide-duplicate"));
    const cells = [];
    cards.forEach((card) => {
      const image = card.querySelector(".horizontal-card-container__media picture") || card.querySelector(".horizontal-card-container__media img") || card.querySelector('picture, img:not([src^="data:"])');
      const content = card.querySelector(".horizontal-card-container__content") || card;
      const eyebrow = content.querySelector(".horizontal-card-container__content--featuredLink");
      const title = content.querySelector(".horizontal-card-container__content-title") || content.querySelector("h1, h2, h3, h4, h5, h6");
      const description = content.querySelector(".horizontal-card-container__content-description");
      const cta = content.querySelector(".horizontal-card-container__content-cta a") || content.querySelector("a.link--with-arrow");
      const textCell = [];
      if (eyebrow && eyebrow.textContent.trim()) textCell.push(linkParagraph(document2, eyebrow));
      if (title && title.textContent.trim()) {
        const h3 = document2.createElement("h3");
        if (title.tagName === "A") {
          const a = document2.createElement("a");
          a.href = title.getAttribute("href") || title.href;
          a.textContent = title.textContent.replace(/\s+/g, " ").trim();
          h3.append(a);
        } else {
          h3.append(...title.childNodes);
        }
        textCell.push(h3);
      }
      if (description && description.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = description.textContent.replace(/\s+/g, " ").trim();
        textCell.push(p);
      }
      if (cta && cta.textContent.trim()) textCell.push(linkParagraph(document2, cta));
      if (!image && !textCell.length) return;
      cells.push([image || "", textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-teaser", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-split.js
  var TEXT_SELECTOR = "h1, h2, h3, h4, h5, h6, p, ul, ol, a.button";
  function parse4(element, { document: document2 }) {
    let slides = [...element.querySelectorAll(".full-section-carousel__slide")];
    if (!slides.length) slides = [...element.querySelectorAll(".swiper-slide, .fp-slide")];
    slides = slides.filter((s) => !s.classList.contains("swiper-slide-duplicate"));
    const cells = [];
    slides.forEach((slide) => {
      const media = slide.querySelector(".full-section-blade__media") || slide;
      const picture = media.querySelector(".background-image picture") || media.querySelector("picture") || media.querySelector('img:not([src^="data:"])');
      const imageCell = [];
      if (picture) imageCell.push(picture);
      const videoSrc = [...media.querySelectorAll("video source[src], video[src]")].map((s) => s.getAttribute("src")).find((src) => src && src !== "/download" && !/\.m3u8(\?|$)/i.test(src));
      if (videoSrc) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = videoSrc;
        a.textContent = videoSrc;
        p.append(a);
        imageCell.push(p);
      }
      const textRoot = slide.querySelector(".full-section-blade__text-wrapper") || slide.querySelector(".full-section-blade__content") || slide;
      const matches = [...textRoot.querySelectorAll(TEXT_SELECTOR)];
      const textCell = matches.filter((el) => !matches.some((other) => other !== el && other.contains(el))).filter((el) => el.textContent.trim().length > 0);
      if (!imageCell.length && !textCell.length) return;
      cells.push([imageCell.length ? imageCell : "", textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-split", cells });
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
        "a.skip-link"
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
        if (a.closest("strong")) return;
        const strong = element.ownerDocument.createElement("strong");
        a.replaceWith(strong);
        strong.append(a);
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
        // Empty placeholder background videos: <video><source src="/download">Sorry, your browser...</video>
        '.background-video:has(source[src="/download"])',
        // Decorative section background patterns (home-pattern-*.png) - conveyed by section style
        // (pattern-waves / pattern-rings); runs after parsers, so block media is unaffected
        ".grid-layout__background",
        // Remaining non-authorable embeds/tracking
        "iframe",
        "noscript",
        "link"
      ]);
    }
  }

  // tools/importer/transformers/boozallen-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
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
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-home.js
  var parsers = {
    "hero-video": parse,
    "columns-media": parse2,
    "cards-teaser": parse3,
    "carousel-split": parse4
  };
  var PAGE_TEMPLATE = {
    "name": "home",
    "description": "Booz Allen homepage: video hero, mission statement, news feature + article cards, featured stories carousel, careers promo + explore cards",
    "urls": [
      "https://www.boozallen.com/"
    ],
    "blocks": [
      {
        "name": "hero-video",
        "instances": [
          ".cyber-hero"
        ]
      },
      {
        "name": "columns-media",
        "instances": [
          ".grid-layout__row:has(> .large-6.grid-layout__column)"
        ]
      },
      {
        "name": "cards-teaser",
        "instances": [
          ".horizontal-card-container"
        ]
      },
      {
        "name": "carousel-split",
        "instances": [
          ".full-section-carousel"
        ]
      }
    ],
    "sections": [
      {
        "id": "rc1",
        "name": "Hero (video/brand animation)",
        "selector": [
          ".aem-Grid > .cyber_hero",
          "body > div:nth-of-type(2) > div.aem-Grid > div.aem-GridColumn:nth-child(1)"
        ],
        "style": null,
        "blocks": [
          "hero-video"
        ],
        "defaultContent": []
      },
      {
        "id": "rc2",
        "name": "Mission statement",
        "selector": [
          ".aem-Grid > .grid-layout__wrapper:has(> .grid-layout > .grid-layout__row.grid-layout-full-width)",
          "body > div:nth-of-type(2) > div.aem-Grid > div.aem-GridColumn:nth-child(2)"
        ],
        "style": "dark",
        "blocks": [],
        "defaultContent": [
          ".grid-layout-full-width h2",
          ".grid-layout-full-width .cmp-text p",
          ".grid-layout-full-width .button-wrapper a"
        ]
      },
      {
        "id": "rc3",
        "name": "News feature + Tech at Full Speed",
        "selector": [
          ".aem-Grid > .grid-layout__wrapper:has(> .grid-layout.min-height--default .content-cards-layout)",
          "body > div:nth-of-type(2) > div.aem-Grid > div.aem-GridColumn:nth-child(3)"
        ],
        "style": "pattern-waves",
        "blocks": [
          "columns-media",
          "cards-teaser"
        ],
        "defaultContent": [
          ".content-cards-layout__content > div:first-child h3"
        ]
      },
      {
        "id": "rc4",
        "name": "Featured stories carousel",
        "selector": [
          ".aem-GridColumn:has(> .full-section-carousel)",
          "body > div:nth-of-type(2) > div.aem-Grid > div.aem-GridColumn:nth-child(4)"
        ],
        "style": null,
        "blocks": [
          "carousel-split"
        ],
        "defaultContent": []
      },
      {
        "id": "rc5",
        "name": "Careers + Explore More",
        "selector": [
          ".aem-Grid > .grid-layout__wrapper:has(> .grid-layout.min-height--unset .content-cards-layout)",
          "body > div:nth-of-type(2) > div.aem-Grid > div.aem-GridColumn:nth-child(5)"
        ],
        "style": "pattern-rings",
        "blocks": [
          "columns-media",
          "cards-teaser"
        ],
        "defaultContent": [
          ".content-cards-layout__content > div:first-child h3"
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
  var import_home_default = {
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
  return __toCommonJS(import_home_exports);
})();
