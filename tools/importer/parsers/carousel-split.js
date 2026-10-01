/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-split. Base: carousel. Source: https://www.boozallen.com/
 * Source: <div class="full-section-carousel"> > section.swiper > .full-section-carousel__slides
 *   .full-section-carousel__slide (x3)
 *     .full-section-blade__text-wrapper: h5 eyebrow, h2 title, .cmp-text p, .button-wrapper a.button
 *     .full-section-blade__media: .background-image picture, .background-video video source
 * Placeholder videos (source[src="/download"]) are ignored; real video sources become a link
 * in the image cell. Swiper loop duplicates (.swiper-slide-duplicate) are skipped.
 * Output: 2 columns per row: [picture (+ optional video link) | h5, h2, p, button link].
 */
const TEXT_SELECTOR = 'h1, h2, h3, h4, h5, h6, p, ul, ol, a.button';

export default function parse(element, { document }) {
  let slides = [...element.querySelectorAll('.full-section-carousel__slide')];
  if (!slides.length) slides = [...element.querySelectorAll('.swiper-slide, .fp-slide')];
  slides = slides.filter((s) => !s.classList.contains('swiper-slide-duplicate'));

  const cells = [];
  slides.forEach((slide) => {
    // Image cell
    const media = slide.querySelector('.full-section-blade__media') || slide;
    const picture = media.querySelector('.background-image picture')
      || media.querySelector('picture')
      || media.querySelector('img:not([src^="data:"])');
    const imageCell = [];
    if (picture) imageCell.push(picture);
    const videoSrc = [...media.querySelectorAll('video source[src], video[src]')]
      .map((s) => s.getAttribute('src'))
      .find((src) => src && src !== '/download' && !/\.m3u8(\?|$)/i.test(src));
    if (videoSrc) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = videoSrc;
      a.textContent = videoSrc;
      p.append(a);
      imageCell.push(p);
    }

    // Text cell
    const textRoot = slide.querySelector('.full-section-blade__text-wrapper')
      || slide.querySelector('.full-section-blade__content')
      || slide;
    const matches = [...textRoot.querySelectorAll(TEXT_SELECTOR)];
    const textCell = matches
      .filter((el) => !matches.some((other) => other !== el && other.contains(el)))
      .filter((el) => el.textContent.trim().length > 0);

    if (!imageCell.length && !textCell.length) return;
    cells.push([imageCell.length ? imageCell : '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-split', cells });
  element.replaceWith(block);
}
