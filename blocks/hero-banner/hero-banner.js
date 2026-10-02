/*
 * Hero Banner block
 * Full-bleed background image with an overlaid heading, intro text and call to action.
 *
 * Authoring (rows in any order; image row is optional):
 *   | Hero Banner                     |
 *   | background picture              |
 *   | H1, paragraph, Learn More link  |
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

function isImageOnly(cell) {
  if (!cell.querySelector('picture')) return false;
  const clone = cell.cloneNode(true);
  clone.querySelectorAll('picture').forEach((p) => p.remove());
  return !clone.textContent.trim();
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  const cells = [...block.children].flatMap((row) => [...row.children]);
  const media = document.createElement('div');
  media.className = 'hero-banner-media';
  const content = document.createElement('div');
  content.className = 'hero-banner-content';

  cells.forEach((cell) => {
    if (isImageOnly(cell)) {
      if (!media.querySelector('picture')) {
        const pic = cell.querySelector('picture');
        const img = pic.querySelector('img');
        if (img) {
          media.append(createOptimizedPicture(img.src, img.alt, true, [
            { media: '(min-width: 900px)', width: '2000' },
            { width: '750' },
          ]));
        } else {
          media.append(pic);
        }
      }
    } else {
      // a mixed cell may still carry a picture - use it as background if none found yet
      const pic = cell.querySelector('picture');
      if (pic && !media.querySelector('picture')) {
        const wrap = pic.closest('p') || pic;
        media.append(pic);
        if (wrap !== pic && !wrap.textContent.trim()) wrap.remove();
      }
      while (cell.firstChild) content.append(cell.firstChild);
    }
  });

  block.replaceChildren();
  if (media.querySelector('picture')) {
    block.append(media);
  } else {
    block.classList.add('hero-banner-no-image');
  }
  if (content.textContent.trim() || content.children.length) block.append(content);
}
