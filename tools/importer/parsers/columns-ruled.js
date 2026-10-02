/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-ruled. Base: columns.
 * Source: https://www.boozallen.com/expertise/artificial-intelligence.html
 * Selector: .aem-Grid:has(> .big_hero) > :nth-child(6) .column_bah
 *   The selector matches TWO sibling .column_bah rows inside the section's aem-Grid:
 *     .title | .column_bah | .rule | .column_bah | .rule | .button_bah
 *   Each .column_bah > .column-bah.row > .large-6.columns (x2) > .text .cmp-text
 *     <p><strong>Title<br></strong>description</p>   (sometimes <span><strong>..)
 * Output: ONE block, one row per .column_bah, 2 cells per row
 *   (each cell = paragraph with bold title line + description).
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

// <p><span><strong>Title<br></strong></span>desc</p> -> <p><strong>Title</strong><br>desc</p>
// (styling spans unwrapped so the bold title is the paragraph's first element - the
// block JS reads it as the item title; trailing <br> moved out so the line break survives)
function normalize(el) {
  el.querySelectorAll('span').forEach((span) => span.replaceWith(...span.childNodes));
  el.querySelectorAll('strong, b').forEach((strong) => {
    let last = strong.lastChild;
    while (last && last.nodeType === 3 && !last.textContent.trim()) last = last.previousSibling;
    if (last && last.nodeName === 'BR') strong.after(last);
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
  // Already merged into a previous columns-ruled block (detached or flagged)
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

  // Detach the consumed sibling rows (and the decorative rules between them)
  rows.slice(1).forEach((row) => {
    row.setAttribute(CONSUMED, 'true');
    row.remove();
  });
  separators.forEach((sep) => sep.remove());

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-ruled', cells });
  element.replaceWith(block);
}
