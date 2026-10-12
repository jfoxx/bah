/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-subnav. Base: columns.
 * Source: https://www.boozallen.com/expertise/artificial-intelligence.html
 * Selector: .horizontal-navigation
 *   ul.horizontal-navigation__links > li.horizontal-navigation__link
 *     a.horizontal-navigation__link-anchor (top-level link; contains decorative
 *       <button>/<img> toggles - invalid nesting, never used as an iteration key)
 *     .horizontal-navigation__sub-links-wrapper ul.horizontal-navigation__sub-links
 *       li.horizontal-navigation__sub-link > a.horizontal-navigation__item-submenu-link
 *   .horizontal-navigation__cta-buttons-container a.button (Careers, Contact Us)
 * Output: 1 row x 2 columns:
 *   cell 1 = ul of top-level links, each optionally with a nested ul of sub-links
 *   cell 2 = CTA links
 * Iteration is keyed on the <li> wrappers (iterationSafe); links are rebuilt from
 * href + own text so the nested toggle buttons/SVG icons are not carried over.
 *
 * Also: https://www.boozallen.com/markets/defense/ai-for-military.html
 * Selector: .in-page-horizontal-nav (a different component, same table shape)
 *   .in-page-horizontal-nav__mobile-header span "MORE CONTENT" / "Close"  -> dropped
 *   ul.in-page-horizontal-nav__linkList > li.in-page-horizontal-nav__list-item
 *     a.in-page-horizontal-nav__nav-item > span.in-page-horizontal-nav__nav-item-text
 *     ul.in-page-horizontal-nav-item__mobile-submenu > li > a > span...-text (sub-links)
 *   CTAs appear twice: .cta-items a (Careers, Contact Us) and .cta-group a (same) -> once each
 */
const SPAN_TEXT = '.in-page-horizontal-nav__nav-item-text, .in-page-horizontal-nav-item__submenu-list-item-text';

function linkText(a) {
  // text of the anchor excluding nested toggle widgets
  const clone = a.cloneNode(true);
  clone.querySelectorAll('div, button, img, span, svg').forEach((n) => n.remove());
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

function makeLink(document, a) {
  let text = linkText(a);
  if (!text) {
    // in-page-horizontal-nav: the label lives in a <span> (removed by linkText)
    const label = a.querySelector(SPAN_TEXT);
    text = label ? label.textContent.replace(/\s+/g, ' ').trim() : '';
  }
  if (!text) return null;
  const link = document.createElement('a');
  link.href = a.getAttribute('href') || a.href || '';
  link.textContent = text;
  return link;
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('li.horizontal-navigation__link')];
  if (!items.length) items = [...element.querySelectorAll('ul.bah-navigation__link-container > li')];
  if (!items.length) items = [...element.querySelectorAll('ul.in-page-horizontal-nav__linkList > li')];

  const list = document.createElement('ul');
  items.forEach((li) => {
    const topAnchor = li.querySelector('a.horizontal-navigation__link-anchor')
      || li.querySelector(':scope > a.in-page-horizontal-nav__nav-item')
      || li.querySelector('a:not(.horizontal-navigation__item-submenu-link)');
    const subAnchors = [...li.querySelectorAll(
      '.horizontal-navigation__sub-links a, a.horizontal-navigation__item-submenu-link, .in-page-horizontal-nav-item__mobile-submenu a',
    )].filter((a, i, arr) => arr.indexOf(a) === i);
    const topLink = topAnchor ? makeLink(document, topAnchor) : null;
    if (!topLink && !subAnchors.length) return;

    const item = document.createElement('li');
    if (topLink) item.append(topLink);
    const subLinks = subAnchors.map((a) => makeLink(document, a)).filter(Boolean);
    if (subLinks.length) {
      const subList = document.createElement('ul');
      subLinks.forEach((link) => {
        const subItem = document.createElement('li');
        subItem.append(link);
        subList.append(subItem);
      });
      item.append(subList);
    }
    list.append(item);
  });

  let ctas = [...element.querySelectorAll('.horizontal-navigation__cta-buttons-container a')];
  if (!ctas.length) {
    // in-page-horizontal-nav renders every CTA twice (.cta-items and .cta-group): keep
    // the first copy of each (href + label)
    const seen = new Set();
    ctas = [...element.querySelectorAll('.cta-items a, .cta-group a, a.in-page-horizontal-nav__cta')]
      .filter((a) => {
        const key = `${a.getAttribute('href')}|${a.textContent.replace(/\s+/g, ' ').trim()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    ctas.forEach((a) => { a.textContent = a.textContent.replace(/\s+/g, ' ').trim(); });
  }
  if (!ctas.length) ctas = [...element.querySelectorAll('.button-wrapper a, a.button')];
  const ctaCell = ctas.filter((a) => a.textContent.trim()).map((a) => {
    const p = document.createElement('p');
    p.append(a);
    return p;
  });

  if (!list.children.length && !ctaCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[list.children.length ? list : '', ctaCell.length ? ctaCell : '']];
  const inPage = element.matches('.in-page-horizontal-nav') || !!element.querySelector('.in-page-horizontal-nav__linkList');
  const variants = inPage ? ['in-page'] : [];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-subnav', variants, cells });
  element.replaceWith(block);
}
