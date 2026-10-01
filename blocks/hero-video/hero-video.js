/*
 * Hero Video block
 * Full-bleed background image with an optional background video and a decorative
 * scroll-down indicator.
 *
 * Authoring (one row, cells optional/any order):
 *   | Hero Video                                                     |
 *   | picture (poster/fallback) | link to video (.mp4 / Scene7) | optional heading/text |
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

const VIDEO_PATTERN = /\.(mp4|webm|m3u8)(\?|$)|scene7\.com\/is\/content\//i;

function isVideoLink(a) {
  return a && VIDEO_PATTERN.test(a.href);
}

function buildVideo(href, poster) {
  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.setAttribute('preload', 'none');
  if (poster) video.poster = poster;
  const source = document.createElement('source');
  // Scene7 "is/content" assets stream as mp4 without a file extension.
  source.src = href;
  source.type = /\.webm(\?|$)/i.test(href) ? 'video/webm' : 'video/mp4';
  video.append(source);
  return video;
}

function buildScrollIndicator(block) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'hero-video-scroll';
  button.setAttribute('aria-label', 'Scroll to content');
  button.addEventListener('click', () => {
    const section = block.closest('.section');
    const next = section ? section.nextElementSibling : block.nextElementSibling;
    if (next) next.scrollIntoView({ behavior: 'smooth' });
  });
  return button;
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  const picture = block.querySelector('picture');
  const videoLink = [...block.querySelectorAll('a')].find(isVideoLink);

  // background media layer
  const media = document.createElement('div');
  media.className = 'hero-video-media';

  if (picture) {
    const img = picture.querySelector('img');
    const optimized = img
      ? createOptimizedPicture(img.src, img.alt || '', true, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }])
      : picture;
    if (img) {
      const newImg = optimized.querySelector('img');
      newImg.setAttribute('loading', 'eager');
      newImg.setAttribute('fetchpriority', 'high');
    }
    media.append(optimized);
  }

  // remaining authored content (heading / text), minus the media we consumed
  const content = document.createElement('div');
  content.className = 'hero-video-content';
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    cell.querySelectorAll('picture').forEach((p) => {
      const parent = p.parentElement;
      p.remove();
      if (parent && parent.tagName === 'P' && !parent.textContent.trim() && !parent.children.length) parent.remove();
    });
    if (videoLink && cell.contains(videoLink)) {
      const wrap = videoLink.closest('p') || videoLink;
      wrap.remove();
    }
    if (cell.textContent.trim() || cell.querySelector('img, svg')) {
      content.append(...cell.childNodes);
    }
  });

  block.replaceChildren(media);
  if (content.children.length) block.append(content);
  block.append(buildScrollIndicator(block));

  if (videoLink) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
      const posterImg = media.querySelector('img');
      const video = buildVideo(videoLink.href, posterImg ? posterImg.currentSrc || posterImg.src : '');
      // defer video loading so the poster image stays the LCP element
      const load = () => {
        video.preload = 'auto';
        media.append(video);
        video.addEventListener('canplay', () => block.classList.add('hero-video-playing'), { once: true });
        video.play().catch(() => {});
      };
      if (document.readyState === 'complete') setTimeout(load, 0);
      else window.addEventListener('load', () => setTimeout(load, 0), { once: true });
    }
  }
}
