/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import columnsSubnavParser from './parsers/columns-subnav.js';
import cardsCarouselParser from './parsers/cards-carousel.js';
import cardsHorizontalParser from './parsers/cards-horizontal.js';
import columnsBackdropParser from './parsers/columns-backdrop.js';
import embedMarketoParser from './parsers/embed-marketo.js';
import columnsCtaParser from './parsers/columns-cta.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/boozallen-cleanup.js';
import sectionsTransformer from './transformers/boozallen-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'columns-subnav': columnsSubnavParser,
  'cards-carousel': cardsCarouselParser,
  'cards-horizontal': cardsHorizontalParser,
  'columns-backdrop': columnsBackdropParser,
  'embed-marketo': embedMarketoParser,
  'columns-cta': columnsCtaParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
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
