/*
 * Columns Media block
 * Two-cell media + text promo. The media cell may sit on either side (authoring order is
 * respected on desktop); on mobile the media always stacks first.
 *
 * Authoring (one or more rows, two cells each):
 *   | Columns Media                                       |
 *   | picture (+ optional video link) | heading, text, button |
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

const VIDEO_PATTERN = /\.(mp4|webm)(\?|$)|scene7\.com\/is\/content\//i;

function isMediaCell(cell) {
  if (!cell.querySelector('picture, video')) return false;
  // a media cell holds only pictures and (optionally) video links - no real text
  const clone = cell.cloneNode(true);
  clone.querySelectorAll('picture, video').forEach((el) => el.remove());
  clone.querySelectorAll('a').forEach((a) => { if (VIDEO_PATTERN.test(a.href)) a.remove(); });
  return !clone.textContent.trim();
}

function decorateVideo(cell) {
  const link = [...cell.querySelectorAll('a')].find((a) => VIDEO_PATTERN.test(a.href));
  if (!link) return;
  const wrap = link.closest('p') || link;
  wrap.remove();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.preload = 'none';
  const source = document.createElement('source');
  source.src = link.href;
  source.type = 'video/mp4';
  video.append(source);
  cell.classList.add('columns-media-has-video');
  cell.append(video);
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      video.preload = 'auto';
      video.addEventListener('canplay', () => cell.classList.add('columns-media-video-playing'), { once: true });
      video.play().catch(() => {});
    }
  });
  observer.observe(cell);
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  [...block.children].forEach((row) => {
    row.classList.add('columns-media-row');
    const cells = [...row.children];
    cells.forEach((cell, idx) => {
      if (isMediaCell(cell)) {
        cell.classList.add('columns-media-media');
        if (idx > 0) row.classList.add('columns-media-media-end');
        cell.querySelectorAll('picture > img').forEach((img) => {
          img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }]));
        });
        decorateVideo(cell);
        // drop empty paragraphs left around pictures
        cell.querySelectorAll('p').forEach((p) => { if (!p.textContent.trim() && !p.querySelector('picture, video')) p.remove(); });
      } else {
        cell.classList.add('columns-media-text');
      }
    });
  });
}
