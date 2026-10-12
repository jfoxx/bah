/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-cta. Base: columns.
 * Source: https://www.boozallen.com/markets/defense/ai-for-military.html
 * Selector: ... generic_block:nth-of-type(7) .column_bah
 *   .column_bah > .row.column-bah
 *     .large-9.columns  .text .cmp-text p ("Ready to drive real-world change ...")
 *     .large-3.columns  .button_bah .button-wrapper a.button.default-style ("Explore Careers")
 * The "Join Booz Allen" H2 above is a separate component and stays default content.
 * Output (columns convention; blocks/columns-cta/columns-cta.js):
 *   1 row x 2 columns: | paragraph(s) | button link |
 * The original <a class="button ..."> is kept so boozallen-cleanup applies the site's
 * button emphasis consistently after parsing.
 */
export default function parse(element, { document }) {
  let columns = [...element.querySelectorAll('.column-bah > .columns')];
  if (!columns.length) columns = [...element.querySelectorAll('.columns[class*="large-"]')];
  if (!columns.length) columns = [element];

  const textContent = [];
  const ctas = [];
  columns.forEach((col) => {
    col.querySelectorAll('a.button, .button-wrapper a, .button_bah a').forEach((a) => {
      if (!ctas.includes(a) && a.textContent.trim()) ctas.push(a);
    });
    const nodes = [...col.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol')]
      .filter((n) => !n.closest('.button_bah, .button-wrapper'));
    nodes
      .filter((n) => !nodes.some((o) => o !== n && o.contains(n)))
      .filter((n) => n.textContent.trim())
      .forEach((n) => textContent.push(n));
  });

  if (!textContent.length && !ctas.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const ctaCell = ctas.map((a) => {
    a.textContent = a.textContent.replace(/\s+/g, ' ').trim();
    const p = document.createElement('p');
    p.append(a);
    return p;
  });

  const cells = [[textContent.length ? textContent : '', ctaCell.length ? ctaCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-cta', cells });
  element.replaceWith(block);
}
