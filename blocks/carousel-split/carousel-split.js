/*
 * Carousel Split block
 * Full-height slides split into a text panel (eyebrow, heading, text, button) and an image
 * panel, with bar-style pagination under the text and optional autoplaying background video.
 *
 * Authoring (one row per slide):
 *   | Carousel Split                                                  |
 *   | picture (+ optional video link) | eyebrow, heading, text, button |
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

const VIDEO_PATTERN = /\.(mp4|webm)(\?|$)|scene7\.com\/is\/content\//i;

let carouselId = 0;

function isMediaCell(cell) {
  if (!cell.querySelector('picture')) return false;
  const clone = cell.cloneNode(true);
  clone.querySelectorAll('picture').forEach((el) => el.remove());
  clone.querySelectorAll('a').forEach((a) => { if (VIDEO_PATTERN.test(a.href)) a.remove(); });
  return !clone.textContent.trim();
}

function decorateMedia(cell, eager) {
  cell.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, eager, [{ media: '(min-width: 900px)', width: '1600' }, { width: '750' }]);
    img.closest('picture').replaceWith(pic);
  });
  const link = [...cell.querySelectorAll('a')].find((a) => VIDEO_PATTERN.test(a.href));
  if (link) {
    (link.closest('p') || link).remove();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('aria-hidden', 'true');
      video.preload = 'none';
      video.dataset.src = link.href;
      cell.append(video);
    }
  }
  cell.querySelectorAll('p').forEach((p) => { if (!p.textContent.trim() && !p.querySelector('picture')) p.remove(); });
}

function playSlideVideo(slide) {
  const video = slide.querySelector('.carousel-split-slide-image video');
  if (!video) return;
  if (!video.querySelector('source')) {
    const source = document.createElement('source');
    source.src = video.dataset.src;
    source.type = 'video/mp4';
    video.append(source);
    video.addEventListener('canplay', () => video.classList.add('carousel-split-video-playing'), { once: true });
    video.load();
  }
  video.play().catch(() => {});
}

function pauseSlideVideo(slide) {
  const video = slide.querySelector('.carousel-split-slide-image video');
  if (video) video.pause();
}

function updateActiveSlide(block, slideIndex) {
  block.dataset.activeSlide = slideIndex;
  block.querySelectorAll('.carousel-split-slide').forEach((slide, idx) => {
    const isActive = idx === slideIndex;
    slide.setAttribute('aria-hidden', !isActive);
    slide.querySelectorAll('a, button').forEach((el) => {
      if (isActive) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });
    if (isActive) playSlideVideo(slide);
    else pauseSlideVideo(slide);
  });
  block.querySelectorAll('.carousel-split-slide-indicator button').forEach((button, idx) => {
    if (idx === slideIndex) {
      button.setAttribute('aria-current', 'true');
      button.disabled = true;
    } else {
      button.removeAttribute('aria-current');
      button.disabled = false;
    }
  });
}

function showSlide(block, slideIndex) {
  const slides = block.querySelectorAll('.carousel-split-slide');
  let idx = slideIndex;
  if (idx < 0) idx = slides.length - 1;
  if (idx >= slides.length) idx = 0;
  block.querySelector('.carousel-split-slides').scrollTo({
    top: 0,
    left: slides[idx].offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  block.querySelectorAll('.carousel-split-slide-indicator button').forEach((button, idx) => {
    button.addEventListener('click', () => showSlide(block, idx));
  });
  block.querySelector('.carousel-split-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.carousel-split-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        updateActiveSlide(block, parseInt(entry.target.dataset.slideIndex, 10));
      }
    });
  }, { root: block.querySelector('.carousel-split-slides'), threshold: 0.6 });
  block.querySelectorAll('.carousel-split-slide').forEach((slide) => observer.observe(slide));
}

function createSlide(row, idx, blockId) {
  const slide = document.createElement('li');
  slide.className = 'carousel-split-slide';
  slide.dataset.slideIndex = idx;
  slide.id = `${blockId}-slide-${idx}`;
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');

  const cells = [...row.children];
  let media = cells.find(isMediaCell);
  if (!media && cells.length > 1) [media] = cells;
  cells.forEach((cell) => {
    if (cell === media) {
      cell.className = 'carousel-split-slide-image';
      decorateMedia(cell, idx === 0);
    } else {
      cell.className = 'carousel-split-slide-content';
    }
  });
  // content panel first (text left, image right on desktop)
  const content = cells.filter((c) => c !== media);
  slide.append(...content);
  if (media) slide.append(media);

  const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading && heading.id) slide.setAttribute('aria-labelledby', heading.id);
  else slide.setAttribute('aria-label', `Slide ${idx + 1}`);
  return slide;
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  carouselId += 1;
  block.id = block.id || `carousel-split-${carouselId}`;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const rows = [...block.children];
  const isSingle = rows.length < 2;

  const container = document.createElement('div');
  container.className = 'carousel-split-slides-container';
  const slidesWrapper = document.createElement('ul');
  slidesWrapper.className = 'carousel-split-slides';
  container.append(slidesWrapper);

  rows.forEach((row, idx) => {
    slidesWrapper.append(createSlide(row, idx, block.id));
    row.remove();
  });
  block.append(container);

  if (isSingle) {
    block.classList.add('carousel-split-single');
    const first = slidesWrapper.querySelector('.carousel-split-slide');
    if (first) playSlideVideo(first);
    return;
  }

  const controls = document.createElement('div');
  controls.className = 'carousel-split-controls';

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Carousel slide controls');
  const indicators = document.createElement('ol');
  indicators.className = 'carousel-split-slide-indicators';
  rows.forEach((_, idx) => {
    const li = document.createElement('li');
    li.className = 'carousel-split-slide-indicator';
    li.innerHTML = `<button type="button" aria-controls="${block.id}-slide-${idx}" aria-label="Show slide ${idx + 1} of ${rows.length}"></button>`;
    indicators.append(li);
  });
  nav.append(indicators);

  const arrows = document.createElement('div');
  arrows.className = 'carousel-split-navigation-buttons';
  arrows.innerHTML = `
    <button type="button" class="carousel-split-prev" aria-label="Previous slide"></button>
    <button type="button" class="carousel-split-next" aria-label="Next slide"></button>
  `;

  controls.append(nav, arrows);
  container.append(controls);

  bindEvents(block);
  updateActiveSlide(block, 0);
}
