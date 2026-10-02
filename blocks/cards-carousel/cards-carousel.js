/*
 * Cards Carousel block
 * Horizontally scrolling row of cards with dot pagination. Cards may be text-only or carry an
 * image; both kinds can be mixed in the same block.
 *
 * Authoring (one row per card):
 *   | Cards Carousel                                   |
 *   | title, description, Learn More link              |   <- text-only card (1 cell)
 *   | image | title, description, Read the Report link |   <- image card (2 cells)
 * The last link in a card makes the whole card clickable.
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

let carouselId = 0;

function isImageCell(cell) {
  if (!cell.querySelector('picture')) return false;
  const clone = cell.cloneNode(true);
  clone.querySelectorAll('picture').forEach((p) => p.remove());
  return !clone.textContent.trim();
}

function buildCard(row, idx, blockId) {
  const li = document.createElement('li');
  li.className = 'cards-carousel-card';
  li.id = `${blockId}-card-${idx}`;
  const cells = [...row.children].filter((c) => c.textContent.trim() || c.querySelector('picture'));
  cells.forEach((cell) => {
    if (isImageCell(cell)) {
      cell.className = 'cards-carousel-card-image';
      cell.querySelectorAll('picture > img').forEach((img) => {
        img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
      });
      li.classList.add('cards-carousel-card-has-image');
    } else {
      cell.className = 'cards-carousel-card-body';
    }
    li.append(cell);
  });

  const body = li.querySelector('.cards-carousel-card-body');
  if (body) {
    const links = body.querySelectorAll('a');
    const cta = links[links.length - 1];
    let ctaWrap;
    if (cta) {
      cta.classList.add('cards-carousel-cta');
      cta.classList.remove('button', 'primary', 'secondary', 'accent');
      ctaWrap = cta.closest('.cards-carousel-card-body > *');
      if (ctaWrap && ctaWrap.textContent.trim() === cta.textContent.trim()) {
        ctaWrap.classList.remove('button-wrapper');
        ctaWrap.classList.add('cards-carousel-cta-wrapper');
      } else {
        ctaWrap = null;
      }
      li.classList.add('cards-carousel-card-linked');
    }

    // title: a heading, or a paragraph that is entirely bold
    const first = body.firstElementChild;
    if (first && first !== ctaWrap) {
      const strong = first.matches('p') && first.querySelector(':scope > strong, :scope > b');
      if (first.matches('h1, h2, h3, h4, h5, h6')
        || (strong && strong.textContent.trim() === first.textContent.trim())) {
        first.classList.add('cards-carousel-card-title');
      }
    }

    // title + description are grouped so the CTA is pushed to the bottom of the card
    const text = document.createElement('div');
    text.className = 'cards-carousel-card-text';
    [...body.children].filter((el) => el !== ctaWrap).forEach((el) => text.append(el));
    if (text.children.length) body.prepend(text);
  }
  return li;
}

function visibleCount(track) {
  const card = track.querySelector('.cards-carousel-card');
  if (!card || !card.offsetWidth) return 1;
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  return Math.max(1, Math.floor((track.clientWidth + gap + 1) / (card.offsetWidth + gap)));
}

function setActiveDot(block, index) {
  block.querySelectorAll('.cards-carousel-dots button').forEach((btn, i) => {
    if (i === index) btn.setAttribute('aria-current', 'true');
    else btn.removeAttribute('aria-current');
  });
}

function scrollToCard(track, index) {
  const cards = track.querySelectorAll('.cards-carousel-card');
  const target = cards[index];
  if (!target) return;
  track.scrollTo({ left: target.offsetLeft - track.firstElementChild.offsetLeft, behavior: 'smooth' });
}

function buildDots(block, track) {
  const nav = block.querySelector('.cards-carousel-dots');
  const cards = track.querySelectorAll('.cards-carousel-card');
  const pages = Math.max(1, cards.length - visibleCount(track) + 1);
  nav.replaceChildren();
  block.classList.toggle('cards-carousel-static', pages < 2);
  if (pages < 2) return;
  const list = document.createElement('ol');
  for (let i = 0; i < pages; i += 1) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-controls', cards[i].id);
    btn.setAttribute('aria-label', `Show card ${i + 1} of ${cards.length}`);
    btn.addEventListener('click', () => scrollToCard(track, i));
    li.append(btn);
    list.append(li);
  }
  nav.append(list);
}

function currentIndex(block, track) {
  const cards = [...track.querySelectorAll('.cards-carousel-card')];
  const start = track.scrollLeft;
  const offset = track.firstElementChild ? track.firstElementChild.offsetLeft : 0;
  let best = 0;
  let bestDist = Infinity;
  cards.forEach((card, i) => {
    const dist = Math.abs(card.offsetLeft - offset - start);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  });
  // at the far end, the last page is active even if it does not align exactly
  const pages = block.querySelectorAll('.cards-carousel-dots button').length;
  if (start + track.clientWidth >= track.scrollWidth - 2 && pages) return pages - 1;
  return Math.min(best, Math.max(pages - 1, 0));
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  carouselId += 1;
  const blockId = block.id || `cards-carousel-${carouselId}`;
  block.id = blockId;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  if (!block.getAttribute('aria-label')) block.setAttribute('aria-label', 'Cards');

  const track = document.createElement('ul');
  track.className = 'cards-carousel-track';
  track.tabIndex = 0;
  [...block.children].forEach((row, idx) => {
    track.append(buildCard(row, idx, blockId));
  });
  if (track.querySelector('.cards-carousel-card-has-image')) block.classList.add('cards-carousel-has-images');

  const dots = document.createElement('nav');
  dots.className = 'cards-carousel-dots';
  dots.setAttribute('aria-label', 'Carousel pagination');

  block.replaceChildren(track, dots);

  let raf;
  const sync = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => setActiveDot(block, currentIndex(block, track)));
  };
  track.addEventListener('scroll', sync, { passive: true });

  let lastVisible = 0;
  const resizeObserver = new ResizeObserver(() => {
    const visible = visibleCount(track);
    if (visible === lastVisible) return;
    lastVisible = visible;
    buildDots(block, track);
    sync();
  });
  resizeObserver.observe(track);
}
