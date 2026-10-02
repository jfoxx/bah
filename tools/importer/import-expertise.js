/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import columnsSubnavParser from './parsers/columns-subnav.js';
import columnsVideoParser from './parsers/columns-video.js';
import cardsCarouselParser from './parsers/cards-carousel.js';
import columnsBackdropParser from './parsers/columns-backdrop.js';
import columnsRuledParser from './parsers/columns-ruled.js';
import columnsStatsParser from './parsers/columns-stats.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/boozallen-cleanup.js';
import sectionsTransformer from './transformers/boozallen-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'columns-subnav': columnsSubnavParser,
  'columns-video': columnsVideoParser,
  'cards-carousel': cardsCarouselParser,
  'columns-backdrop': columnsBackdropParser,
  'columns-ruled': columnsRuledParser,
  'columns-stats': columnsStatsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
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
