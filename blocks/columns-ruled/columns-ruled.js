/*
 * Columns Ruled block
 * Grid of short text items (title + description) with a horizontal rule after each row.
 *
 * Authoring (any number of rows, usually two cells each):
 *   | Columns Ruled                                   |
 *   | **Title** description | **Title** description   |
 *   | #### Title + paragraph | #### Title + paragraph |
 * Rows with fewer cells keep the same column width; empty cells are preserved as gaps.
 */

const OPTION_CLASSES = [];

function markTitle(cell) {
  const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    heading.classList.add('columns-ruled-title');
    return;
  }
  // bold run at the start of the first paragraph acts as the title; inline-only cells
  // (`<div><strong>Title</strong><br> text</div>`, as imported) have no paragraph wrapper
  const first = cell.querySelector('p') || cell;
  const lead = first.firstElementChild;
  if (lead && (lead.tagName === 'STRONG' || lead.tagName === 'B')
    && first.textContent.trim().startsWith(lead.textContent.trim())) {
    lead.classList.add('columns-ruled-title');
  }
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  const rows = [...block.children];
  const maxCols = rows.reduce((max, row) => Math.max(max, row.children.length), 1);
  block.style.setProperty('--columns-ruled-cols', maxCols);

  rows.forEach((row) => {
    row.classList.add('columns-ruled-row');
    [...row.children].forEach((cell) => {
      cell.classList.add('columns-ruled-item');
      if (!cell.textContent.trim() && !cell.querySelector('picture')) {
        cell.classList.add('columns-ruled-empty');
        return;
      }
      markTitle(cell);
    });
  });
}
