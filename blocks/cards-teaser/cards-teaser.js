/*
 * Cards Teaser block
 * Grid of teaser cards: image, optional eyebrow (category), title link,
 * optional description, and an arrow call-to-action link.
 *
 * Authoring (one row per card):
 *   | Cards Teaser                                                        |
 *   | picture | eyebrow (optional), title (heading/strong), description, CTA link |
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

const HEADING = 'h1, h2, h3, h4, h5, h6';

function isImageCell(cell) {
  return !!cell.querySelector('picture') && !cell.textContent.trim();
}

function decorateBody(body) {
  // decorateButtons() turns lone-link paragraphs into buttons; teaser links are plain text links
  body.querySelectorAll('.button-container, .button-wrapper').forEach((p) => p.classList.remove('button-container', 'button-wrapper'));
  body.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary', 'accent'));
  const children = [...body.children];
  let title = body.querySelector(HEADING);
  // titles authored as a bold paragraph instead of a heading
  if (!title) {
    title = children.find((el) => el.tagName === 'P' && el.querySelector('strong') && el.textContent.trim() === el.querySelector('strong').textContent.trim());
  }
  if (title) {
    title.classList.add('cards-teaser-title');
    const idx = children.indexOf(title);
    // anything before the title is the eyebrow
    children.slice(0, idx).forEach((el) => el.classList.add('cards-teaser-eyebrow'));
  }

  // the last paragraph that is only a link is the CTA
  const last = children[children.length - 1];
  if (last && last !== title && last.tagName === 'P') {
    const link = last.querySelector('a');
    if (link && last.textContent.trim() === link.textContent.trim()) {
      last.classList.add('cards-teaser-cta');
    }
  }

  children.forEach((el) => {
    if (el.tagName === 'P' && !el.className) el.classList.add('cards-teaser-description');
  });
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-teaser-card';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (isImageCell(div)) {
        div.className = 'cards-teaser-image';
      } else {
        div.className = 'cards-teaser-body';
        decorateBody(div);
      }
    });
    if (li.children.length) ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  block.replaceChildren(ul);
}
