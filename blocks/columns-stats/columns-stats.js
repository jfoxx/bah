/*
 * Columns Stats block
 * Grid of statistics: a prominent value followed by a caption, with a rule between rows.
 *
 * Authoring (any number of rows, usually two cells each):
 *   | Columns Stats                                                |
 *   | **2,350+** / caption with **bold lead** | **100+** / caption |
 * The value is the first paragraph (or heading) of each cell; everything after it is the caption.
 */

const OPTION_CLASSES = [];

function decorateStat(cell) {
  cell.classList.add('columns-stats-item');
  const first = cell.firstElementChild;
  if (!first) {
    cell.classList.add('columns-stats-empty');
    return;
  }
  first.classList.add('columns-stats-value');
  const caption = document.createElement('div');
  caption.className = 'columns-stats-caption';
  while (first.nextSibling) caption.append(first.nextSibling);
  if (caption.textContent.trim() || caption.children.length) cell.append(caption);
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  const rows = [...block.children];
  const maxCols = rows.reduce((max, row) => Math.max(max, row.children.length), 1);
  block.style.setProperty('--columns-stats-cols', maxCols);

  rows.forEach((row) => {
    row.classList.add('columns-stats-row');
    [...row.children].forEach(decorateStat);
  });
}
