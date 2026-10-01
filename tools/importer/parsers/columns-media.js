/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media. Base: columns. Source: https://www.boozallen.com/
 * Source: <div class="grid-layout__row ..."> with two direct children
 *   <div class="large-6 medium-12 grid-layout__column"> (image column / text column).
 * Instance 1 (rc3): image | h4 + p + button.
 * Instance 2 (rc5, .grid-layout__row--reverse): h2 + h5 + p + button | image.
 * Source cell order is preserved (the --reverse class is a visual concern only).
 * Output: 1 row x N columns (N = number of grid-layout__column children, 2 on this page).
 */
const CONTENT_SELECTOR = 'picture, img, video, h1, h2, h3, h4, h5, h6, p, ul, ol, a.button';

function collectColumnContent(column) {
  const matches = [...column.querySelectorAll(CONTENT_SELECTOR)];
  // keep only top-level matches (e.g. skip img inside picture, a inside p)
  return matches.filter((el) => !matches.some((other) => other !== el && other.contains(el)))
    .filter((el) => {
      if (el.matches('picture, img, video')) return true;
      return el.textContent.trim().length > 0;
    });
}

export default function parse(element, { document }) {
  let columns = [...element.querySelectorAll(':scope > .grid-layout__column')];
  if (!columns.length) columns = [...element.querySelectorAll(':scope > [class*="large-"]')];
  if (!columns.length) columns = [...element.children];

  const row = columns.map((col) => collectColumnContent(col)).filter((cell) => cell.length);

  if (!row.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
