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
 *
 * Also: https://www.boozallen.com/markets/defense/ai-for-military.html
 * Selector: #content > div.overview-hero-wrapper.full
 *   <div class="overview-hero-wrapper full">
 *     <div class="overview-hero-background" style="background-image: url(/content/dam/...)"></div>
 *       (live DOM: inline-style background, no <img>; the cleaned snapshot has an <img>)
 *     <div class="row">... <div class="overview-hero-data full"><h1 class="title--black">AI for Defense</h1>
 * Light photo with dark (black) title, no paragraph/CTA -> emitted with the "light"
 * option: "Hero Banner (light)". The .big-hero instances keep the default (no option).
 */
const SITE_ORIGIN = 'https://www.boozallen.com';

// <img> (absolute boozallen.com URL) from an element's inline/computed background-image
function imageFromBackground(el, document) {
  if (!el) return null;
  let value = (el.style && el.style.backgroundImage) || '';
  if (!/url\(/.test(value)) {
    const raw = el.getAttribute('style') || '';
    const m = raw.match(/background(?:-image)?\s*:[^;]*url\([^)]*\)/i);
    // undo CSS escapes such as "\2f " -> "/"
    if (m) value = m[0].replace(/\\([0-9a-f]{1,6})\s?/gi, (s, hex) => String.fromCodePoint(parseInt(hex, 16)));
  }
  if (!/url\(/.test(value) && document.defaultView && document.defaultView.getComputedStyle) {
    value = document.defaultView.getComputedStyle(el).backgroundImage || '';
  }
  const url = (value.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/) || [])[1];
  if (!url || url.startsWith('data:')) return null;
  let src;
  try {
    src = new URL(url.trim(), SITE_ORIGIN).href;
  } catch (e) {
    return null;
  }
  const img = document.createElement('img');
  img.src = src;
  return img;
}

export default function parse(element, { document }) {
  const isOverviewHero = element.classList.contains('overview-hero-wrapper')
    || !!element.querySelector('.overview-hero-data');
  const isLight = isOverviewHero || !!element.querySelector('h1.title--black');

  const bgImg = element.querySelector('.big-hero-image img, img.hero-background, picture img')
    || element.querySelector('.overview-hero-background img')
    || (isOverviewHero ? imageFromBackground(element.querySelector('.overview-hero-background'), document) : null);

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

  const variants = isLight ? ['light'] : [];
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', variants, cells });
  element.replaceWith(block);
}
