/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-teaser. Base: cards. Source: https://www.boozallen.com/
 * Source: <div class="horizontal-card-container"> (Swiper) with cards
 *   .horizontal-card-container__card
 *     .horizontal-card-container__media img
 *     .horizontal-card-container__content
 *       a.horizontal-card-container__content--featuredLink (category eyebrow, rc3 only)
 *       a.horizontal-card-container__content-title          (title link)
 *       p.horizontal-card-container__content-description    (description, populated in rc5 only)
 *       .horizontal-card-container__content-cta a           (arrow CTA: "Read now" / "Learn more")
 * Iteration is keyed on the card <div> (block-level wrapper), never on the anchors.
 * Swiper loop duplicates (.swiper-slide-duplicate) are skipped.
 * Output: 2 columns per row: [image | eyebrow p, h3 title link, description p, CTA p].
 */
function linkParagraph(document, source) {
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = source.getAttribute('href') || source.href || '';
  a.textContent = source.textContent.replace(/\s+/g, ' ').trim();
  p.append(a);
  return p;
}

export default function parse(element, { document }) {
  let cards = [...element.querySelectorAll('.horizontal-card-container__card')];
  if (!cards.length) cards = [...element.querySelectorAll('.swiper-slide__wrapper, .swiper-slide')];
  cards = cards.filter((card) => !card.closest('.swiper-slide-duplicate'));

  const cells = [];
  cards.forEach((card) => {
    const image = card.querySelector('.horizontal-card-container__media picture')
      || card.querySelector('.horizontal-card-container__media img')
      || card.querySelector('picture, img:not([src^="data:"])');

    const content = card.querySelector('.horizontal-card-container__content') || card;
    const eyebrow = content.querySelector('.horizontal-card-container__content--featuredLink');
    const title = content.querySelector('.horizontal-card-container__content-title')
      || content.querySelector('h1, h2, h3, h4, h5, h6');
    const description = content.querySelector('.horizontal-card-container__content-description');
    const cta = content.querySelector('.horizontal-card-container__content-cta a')
      || content.querySelector('a.link--with-arrow');

    const textCell = [];
    if (eyebrow && eyebrow.textContent.trim()) textCell.push(linkParagraph(document, eyebrow));
    if (title && title.textContent.trim()) {
      const h3 = document.createElement('h3');
      if (title.tagName === 'A') {
        const a = document.createElement('a');
        a.href = title.getAttribute('href') || title.href;
        a.textContent = title.textContent.replace(/\s+/g, ' ').trim();
        h3.append(a);
      } else {
        h3.append(...title.childNodes);
      }
      textCell.push(h3);
    }
    if (description && description.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = description.textContent.replace(/\s+/g, ' ').trim();
      textCell.push(p);
    }
    if (cta && cta.textContent.trim()) textCell.push(linkParagraph(document, cta));

    if (!image && !textCell.length) return;
    cells.push([image || '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-teaser', cells });
  element.replaceWith(block);
}
