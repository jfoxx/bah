/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroVideoParser from './parsers/hero-video.js';
import columnsMediaParser from './parsers/columns-media.js';
import cardsTeaserParser from './parsers/cards-teaser.js';
import carouselSplitParser from './parsers/carousel-split.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/boozallen-cleanup.js';
import sectionsTransformer from './transformers/boozallen-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-video': heroVideoParser,
  'columns-media': columnsMediaParser,
  'cards-teaser': cardsTeaserParser,
  'carousel-split': carouselSplitParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
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

// TRANSFORMER REGISTRY - section transformer runs after cleanup
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Initial cleanup (+ section breaks)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block; skip elements already replaced by an earlier parser
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup + section metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path; root URL maps to /index
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
