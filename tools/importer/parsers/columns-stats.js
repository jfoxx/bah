/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-stats. Base: columns.
 * Source: https://www.boozallen.com/expertise/artificial-intelligence.html
 * Selector: .aem-Grid:has(> .big_hero) > :nth-child(9) .column_bah
 *   The selector matches TWO sibling .column_bah rows inside the section's aem-Grid:
 *     .column_bah | .spacer | .rule | .column_bah | .spacer | .button_bah
 *   Each .column_bah > .column-bah.row > .large-6.columns (x2) > .text .cmp-text
 *     <p><strong><span class="rte-xxlarge">2,350+</span></strong></p>
 *     <p><strong><span class="rte-large"><strong>AI practitioners </strong>are employed...</span></strong></p>
 * Output: ONE block, one row per .column_bah, 2 cells per row
 *   (each cell = p(strong value) + p(caption with strong lead phrase)).
 * When parsing the first row, following sibling .column_bah rows (separated only by
 * decorative .rule / .spacer elements) are consumed into the same block and removed
 * from the DOM; when the importer later reaches those detached matches the parser
 * exits without output.
 */
const CONSUMED = 'data-excat-consumed';
const SEPARATOR = '.rule, .spacer';

function columnsOf(row) {
  let cols = [...row.querySelectorAll(':scope > .column-bah > .columns, :scope > .row > .columns')];
  if (!cols.length) cols = [...row.querySelectorAll('.columns[class*="large-"]')];
  return cols.filter((c, i, arr) => arr.indexOf(c) === i);
}

// Unwrap styling spans and any bold run that itself contains a bold run, so the
// caption keeps only its bold lead phrase:
// <strong><span><strong>Lead </strong>rest</span></strong> -> <strong>Lead </strong>rest
function normalize(el) {
  el.querySelectorAll('span').forEach((span) => span.replaceWith(...span.childNodes));
  [...el.querySelectorAll('strong, b')].forEach((strong) => {
    if (strong.querySelector('strong, b')) strong.replaceWith(...strong.childNodes);
  });
  return el;
}

function cellContent(column) {
  const matches = [...column.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol')];
  return matches
    .filter((el) => !matches.some((o) => o !== el && o.contains(el)))
    .filter((el) => el.textContent.trim())
    .map(normalize);
}

export default function parse(element, { document }) {
  // Already merged into a previous columns-stats block (detached or flagged)
  if (element.hasAttribute(CONSUMED) || !element.parentNode) return;

  // Collect this row plus following sibling rows of the same block
  const rows = [element];
  const separators = [];
  let pending = [];
  let next = element.nextElementSibling;
  while (next) {
    if (next.matches('.column_bah')) {
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
  // pad short rows so every row has the same number of cells
  cells.forEach((r) => { while (r.length < width) r.push(''); });
  cells.forEach((r, i) => { cells[i] = r.map((c) => (Array.isArray(c) && !c.length ? '' : c)); });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Detach the consumed sibling rows (and the decorative rules/spacers between them)
  rows.slice(1).forEach((row) => {
    row.setAttribute(CONSUMED, 'true');
    row.remove();
  });
  separators.forEach((sep) => sep.remove());

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-stats', cells });
  element.replaceWith(block);
}
