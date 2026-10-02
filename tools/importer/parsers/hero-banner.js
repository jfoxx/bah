/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero.
 * Source: https://www.boozallen.com/expertise/artificial-intelligence.html
 * Selector: .big-hero
 *   <div class="js-big-hero big-hero big-hero__stacked">
 *     <div class="big-hero-image"><picture>...<img class="hero-background ..."></picture></div>
 *     <div class="row">... <div class="big-hero__content-text">
 *       <p class="big-hero__emphasis-text-above-title">intro</p>
 *       <h1 class="big-hero__title--align-left">Artificial Intelligence</h1>
 *     </div><div class="big-hero__cta">... <a class="button button--white">Learn More</a>
 * Output (1 column): row 1 = background image (optional); row 2 = H1, paragraph, CTA link.
 * H1 is authored first to match the rendered order.
 */
export default function parse(element, { document }) {
  const bgImg = element.querySelector('.big-hero-image img, img.hero-background, picture img');

  const heading = element.querySelector('h1, h2, [class*="big-hero__title"]');
  const paragraphs = [...element.querySelectorAll(
    '.big-hero__content-text p, .big-hero__content-stacked > p, [class*="emphasis-text"]',
  )].filter((p, i, arr) => arr.indexOf(p) === i && p.textContent.trim()
    && !arr.some((o) => o !== p && o.contains(p)));
  const ctas = [...element.querySelectorAll('.big-hero__cta a, .button-wrapper a')]
    .filter((a, i, arr) => arr.indexOf(a) === i);

  if (!heading && !paragraphs.length && !bgImg) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (bgImg) cells.push([bgImg]);

  const contentCell = [];
  if (heading) contentCell.push(heading);
  contentCell.push(...paragraphs);
  contentCell.push(...ctas);
  if (contentCell.length) cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
