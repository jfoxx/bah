/*
 * Cards Horizontal block
 * One or more horizontal teaser cards: thumbnail on the left, linked title and a
 * tag/eyebrow (e.g. "Case Study") on the right. The heading above the cards is default content.
 *
 * Authoring (one row per card; cells may be in either order, image is optional):
 *   | Cards Horizontal                              |
 *   | picture | linked title, tag text (e.g. Case Study) |
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

const HEADING = 'h1, h2, h3, h4, h5, h6';

function isImageCell(cell) {
  if (!cell.querySelector('picture')) return false;
  const clone = cell.cloneNode(true);
  clone.querySelectorAll('picture').forEach((p) => p.remove());
  return !clone.textContent.trim();
}

function decorateBody(body) {
  // decorateButtons() may turn a lone formatted link into a button; card links stay text links
  body.querySelectorAll('.button-wrapper, .button-container').forEach((p) => p.classList.remove('button-wrapper', 'button-container'));
  body.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary', 'accent'));

  // text authored directly in the cell (no paragraph) - wrap so it can be classed
  if (!body.children.length && body.textContent.trim()) {
    const p = document.createElement('p');
    while (body.firstChild) p.append(body.firstChild);
    body.append(p);
  }

  const children = [...body.children];
  // title: a heading, else the first element containing a link, else the first element
  const title = body.querySelector(HEADING)
    || children.find((el) => el.querySelector('a') || el.tagName === 'A')
    || children[0];
  if (title) title.classList.add('cards-horizontal-title');
  children.forEach((el) => {
    if (el !== title) el.classList.add('cards-horizontal-tag');
  });
  return title;
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-horizontal-card';
    const cells = [...row.children].filter((c) => c.textContent.trim() || c.querySelector('picture'));
    let image;
    let body;
    cells.forEach((cell) => {
      if (!image && isImageCell(cell)) {
        image = cell;
        image.className = 'cards-horizontal-image';
      } else if (!body) {
        body = cell;
        body.className = 'cards-horizontal-body';
      } else {
        // extra text cells are merged into the body
        while (cell.firstChild) body.append(cell.firstChild);
      }
    });
    if (body) decorateBody(body);
    if (image) li.append(image);
    if (body) li.append(body);
    if (!image) li.classList.add('cards-horizontal-no-image');

    // make the thumbnail follow the title link
    const link = body && body.querySelector('.cards-horizontal-title a[href]');
    if (image && link) {
      const a = document.createElement('a');
      a.href = link.href;
      a.tabIndex = -1;
      a.setAttribute('aria-hidden', 'true');
      while (image.firstChild) a.append(image.firstChild);
      image.append(a);
    }
    if (li.children.length) ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  block.replaceChildren(ul);
}
