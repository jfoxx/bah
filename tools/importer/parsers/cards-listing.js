/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-listing. Base: cards (custom config model, like Block Collection "search").
 * Source: https://newsroom.boozallen.com/press-releases
 * Selector: .block-nir-news__widget
 *   <div class="block--news-list-starter ... block-nir-news__widget">
 *     <div class="nir-widget"> <div class="nir-widget--content">
 *       <div class="nir-widget--form">  (year <select> + Filter button)
 *       <div class="nir-widget--list">  10 x .nir-widget-article
 *         (image, .nir-widget--news--headline a, .nir-widget--news--date-time,
 *          .nir-widget--news--teaser, .nir-widget--news--categories .field__item = "Press Release")
 *       <div class="lfg-widget-footer"> .nir-widget--pager + .nir-widget--total-results
 *
 * Output: a CONFIG block only (the list is rendered at runtime by blocks/cards-listing
 * from the news-releases query index):
 *   | cards-listing                                   |
 *   | <a href="/news-releases/query-index.json">      |
 *   | Tag       | Press Release (tag pill text)       |
 *   | Page Size | 10                                  |
 *
 * INTENTIONAL CONTENT LOSS: the 10 static source items, the year form and the pager are
 * NOT emitted. The parser validator's content-completeness check will report the item
 * titles/dates/excerpts as "missing". This is expected and was agreed with the user: the
 * items are data from /news-releases/query-index.json, not authored content.
 */
const INDEX_PATH = '/news-releases/query-index.json';
const DEFAULT_TAG = 'Press Release';
const PAGE_SIZE = '10';

export default function parse(element, { document }) {
  // Tag pill text: the most common category label among the source items.
  const counts = {};
  element.querySelectorAll('.nir-widget--news--categories .field__item').forEach((el) => {
    const text = el.textContent.replace(/\s+/g, ' ').trim();
    if (text) counts[text] = (counts[text] || 0) + 1;
  });
  const tag = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || DEFAULT_TAG;

  const link = document.createElement('a');
  link.href = INDEX_PATH;
  link.textContent = INDEX_PATH;

  const cells = [
    [link],
    ['Tag', tag],
    ['Page Size', PAGE_SIZE],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-listing', cells });
  element.replaceWith(block);
}
