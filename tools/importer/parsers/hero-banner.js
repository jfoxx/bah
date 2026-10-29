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
 *
 * Also: https://newsroom.boozallen.com/press-releases
 * Selector: #content > div.overview-hero-wrapper   (no .full on the wrapper)
 *   <div class="overview-hero-wrapper">
 *     <div class="overview-hero-background">   (live DOM: inline-style background-image
 *        url(/system/files-encrypted/nasdaq_kms/inline-images/media-center-page-hero.jpg);
 *        the snapshot has .region-banner-image ... <img class="banner_img" src="...">)
 *     <div class="row">... <div class="overview-hero-data full"><h1>Press Releases</h1>
 * White H1 over a dark photo -> default variant (NO "light" option). Relative image URLs
 * are resolved against https://newsroom.boozallen.com (detection: .region-banner-image /
 * img.banner_img, or a newsroom.boozallen.com page URL).
 */
const SITE_ORIGIN = 'https://www.boozallen.com';
const NEWSROOM_ORIGIN = 'https://newsroom.boozallen.com';

// Newsroom (Drupal/Nasdaq IR) overview hero: banner-image region or a newsroom page URL
function isNewsroomHero(element, document) {
  if (element.querySelector('.region-banner-image, img.banner_img')) return true;
  // Drupal / Nasdaq IR asset paths in the inline background-image
  const bg = element.querySelector('.overview-hero-background');
  const style = (bg && bg.getAttribute('style')) || '';
  if (/url\([^)]*(\/system\/files|\/sites\/g\/files|nasdaq_kms)/i.test(style)) return true;
  try {
    const host = (document.defaultView && document.defaultView.location
      && document.defaultView.location.hostname) || '';
    return host === 'newsroom.boozallen.com';
  } catch (e) {
    return false;
  }
}

// <img> (absolute URL on `origin`) from an element's inline/computed background-image
function imageFromBackground(el, document, origin = SITE_ORIGIN) {
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
    src = new URL(url.trim(), origin).href;
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
  const isNewsroom = isOverviewHero && isNewsroomHero(element, document);
  // light = black title over a light photo (www.boozallen.com overview heroes).
  // The newsroom hero has a white H1 and keeps the default variant.
  const isLight = (isOverviewHero && !isNewsroom) || !!element.querySelector('h1.title--black');

  let bgImg = element.querySelector('.big-hero-image img, img.hero-background, picture img')
    || element.querySelector('.overview-hero-background img')
    || (isOverviewHero ? imageFromBackground(
      element.querySelector('.overview-hero-background'),
      document,
      isNewsroom ? NEWSROOM_ORIGIN : SITE_ORIGIN,
    ) : null);
  // Newsroom <img> with a root-relative src: make it absolute on the newsroom host
  if (isNewsroom && bgImg && bgImg.getAttribute('src')
    && /^\/(?!\/)/.test(bgImg.getAttribute('src'))) {
    const img = document.createElement('img');
    img.src = new URL(bgImg.getAttribute('src'), NEWSROOM_ORIGIN).href;
    if (bgImg.getAttribute('alt')) img.alt = bgImg.getAttribute('alt');
    bgImg = img;
  }

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
