/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-video. Base: hero. Source: https://www.boozallen.com/
 * Source: <div class="cyber-hero"> containing
 *   .cyber-hero__background > .background-image picture (poster; alt carries the message)
 *   .cyber-hero__background > .background-video video > source[src] (Scene7 video)
 * Scroll indicator (.cyber-hero__scroll-indicator) is decoration and is not authored.
 * Output: 1 column, 1 content row: [picture + link to the video].
 */
export default function parse(element, { document }) {
  // Poster / fallback image
  const picture = element.querySelector('.background-image picture')
    || element.querySelector('.cyber-hero__background picture')
    || element.querySelector('picture:not(.cyber-hero__scroll-indicator picture)');
  let image = picture;
  if (!image) {
    image = [...element.querySelectorAll('img')]
      .find((img) => !img.closest('.cyber-hero__scroll-indicator')) || null;
  }

  // Background video: prefer the progressive (non-.m3u8) Scene7 source
  const sources = [...element.querySelectorAll('video source[src], video[src]')]
    .map((s) => s.getAttribute('src'))
    .filter((src) => src && src !== '/download');
  const videoSrc = sources.find((src) => !/\.m3u8(\?|$)/i.test(src)) || sources[0];

  // Optional text content if a future instance carries it
  const heading = element.querySelector('.cyber-hero__text h1, .cyber-hero__text h2, .cyber-hero__content h1, .cyber-hero__content h2');
  const texts = [...element.querySelectorAll('.cyber-hero__text p, .cyber-hero__content .cmp-text p')];

  if (!image && !videoSrc && !heading) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [];
  if (image) contentCell.push(image);
  if (videoSrc) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = videoSrc;
    a.textContent = videoSrc;
    p.append(a);
    contentCell.push(p);
  }
  if (heading) contentCell.push(heading);
  contentCell.push(...texts);

  const cells = [[contentCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-video', cells });
  element.replaceWith(block);
}
