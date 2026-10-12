/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-horizontal. Base: cards.
 * Source: https://www.boozallen.com/markets/defense/ai-for-military.html
 * Selector: ... generic_block:nth-of-type(2) .dynamic-content-super-wrapper
 *   .dynamic-content-item.card (one per teaser)
 *     a.large-content-type ("Case Study", mobile duplicate of the tag)
 *     a.manual-path[href]
 *       .dynamic-article-image-container img
 *       span.large-title (truncated "…" duplicate - ignored)
 *       .card-content span.title.article-title (full title)
 *     .card-meta a.content-type ("Case Study" tag)
 * The H4 lead-in sits outside this element and stays default content.
 * Output (cards convention, 2 columns): one row per card: | image | linked title, tag text |
 * (blocks/cards-horizontal/cards-horizontal.js). Iteration is keyed on the
 * .dynamic-content-item block wrapper, never on the anchors.
 */
function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.dynamic-content-item')];
  if (!items.length) items = [...element.querySelectorAll('.card')];

  const cells = [];
  items.forEach((item) => {
    const linkEl = item.querySelector('a.manual-path')
      || item.querySelector('a[href]:not(.content-type):not(.large-content-type)');
    const titleEl = item.querySelector('.card-content .title, .card-content .article-title')
      || item.querySelector('.article-title:not(.large-title)');
    const title = clean(titleEl ? titleEl.textContent : '');
    const img = item.querySelector('.dynamic-article-image-container img')
      || item.querySelector('img:not([src^="data:"])');
    const tagEl = item.querySelector('.card-meta .content-type, a.content-type')
      || item.querySelector('.large-content-type');
    const tag = clean(tagEl ? tagEl.textContent : '');

    if (!title && !img) return;

    const body = [];
    if (title) {
      const p = document.createElement('p');
      const href = linkEl ? linkEl.getAttribute('href') : '';
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title;
        p.append(a);
      } else {
        p.textContent = title;
      }
      body.push(p);
    }
    if (tag) {
      const p = document.createElement('p');
      p.textContent = tag;
      body.push(p);
    }

    cells.push([img || '', body]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-horizontal', cells });
  element.replaceWith(block);
}
