/*
 * Columns Backdrop block
 * Full-bleed background image with a text panel occupying one half. Cell order decides the
 * side: text first -> text on the left; image first -> text on the right.
 *
 * Authoring (one row, two cells):
 *   | Columns Backdrop          |
 *   | H2, paragraph | image     |   <- text left
 *   | image | H5, H2, paragraph |   <- text right
 * Without an image the text renders as a plain half-width panel.
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

function isImageCell(cell) {
  if (!cell.querySelector('picture')) return false;
  const clone = cell.cloneNode(true);
  clone.querySelectorAll('picture').forEach((p) => p.remove());
  return !clone.textContent.trim();
}

function decorateRow(row) {
  row.classList.add('columns-backdrop-row');
  const cells = [...row.children];
  const imageIdx = cells.findIndex(isImageCell);
  const textCells = cells.filter((_, i) => i !== imageIdx);

  const text = document.createElement('div');
  text.className = 'columns-backdrop-text';
  textCells.forEach((cell) => {
    while (cell.firstChild) text.append(cell.firstChild);
  });

  const inner = document.createElement('div');
  inner.className = 'columns-backdrop-inner';
  inner.append(text);

  row.replaceChildren();
  if (imageIdx >= 0) {
    const media = cells[imageIdx];
    media.className = 'columns-backdrop-media';
    media.querySelectorAll('picture > img').forEach((img) => {
      img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '750' },
      ]));
    });
    row.append(media);
    // image authored first means the text sits in the end half
    const textFirst = textCells.length && cells.indexOf(textCells[0]) < imageIdx;
    row.classList.add(textFirst ? 'columns-backdrop-text-start' : 'columns-backdrop-text-end');
  } else {
    row.classList.add('columns-backdrop-text-start', 'columns-backdrop-no-image');
  }
  row.append(inner);
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');
  [...block.children].forEach(decorateRow);
}
