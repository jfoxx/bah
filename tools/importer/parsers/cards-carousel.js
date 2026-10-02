/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-carousel. Base: cards.
 * Source: https://www.boozallen.com/expertise/artificial-intelligence.html
 * Selector: .card_carousel
 *   .swiper-wrapper > .card_generic (one per card)
 *     .card-generic__component > .card-generic__wrapper > a.card-generic__linkContainer[href]
 *       .card-generic__image-container img.card-generic__image   (rc7 only - image cards)
 *       .card-generic__text-container
 *         .card-generic__title, .card-generic__body
 *         .card-generic__cta .card-generic__cta-text ("Learn More" / "Read the Report")
 * Output: one row per card (blocks/cards-carousel/README + block JS):
 *   text-only card (rc4): | title, description, CTA link |
 *   image card (rc7):     | image | title, description, CTA link |
 * Iteration is keyed on the .card_generic slide wrapper, never on the <a> link
 * container (inline element wrapping block content - merge-prone in html2md).
 * The link href is read off the card's link container and re-attached to the CTA.
 */
function ownText(el) {
  if (!el) return '';
  const clone = el.cloneNode(true);
  clone.querySelectorAll('img, svg, [class*="icon"]').forEach((n) => n.remove());
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  let cards = [...element.querySelectorAll('.card_generic')];
  if (!cards.length) cards = [...element.querySelectorAll('.card-generic__component')];
  if (!cards.length) cards = [...element.querySelectorAll('.swiper-slide')];

  const cells = [];
  cards.forEach((card) => {
    const title = ownText(card.querySelector('.card-generic__title'));
    const body = ownText(card.querySelector('.card-generic__body'));
    const linkEl = card.querySelector('a.card-generic__linkContainer') || card.querySelector('a[href]');
    const href = linkEl ? linkEl.getAttribute('href') : '';
    const ctaText = ownText(card.querySelector('.card-generic__cta-text, .card-generic__cta')) || 'Learn More';
    const img = card.querySelector('img.card-generic__image')
      || card.querySelector('.card-generic__image-container img:not([src^="data:"])');

    if (!title && !body && !img) return;

    const textCell = [];
    if (title) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = title;
      p.append(strong);
      textCell.push(p);
    }
    if (body) {
      const p = document.createElement('p');
      p.textContent = body;
      textCell.push(p);
    }
    if (href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = ctaText;
      p.append(a);
      textCell.push(p);
    }

    if (img) cells.push([img, textCell]);
    else cells.push([textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-carousel', cells });
  element.replaceWith(block);
}
