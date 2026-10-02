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
 */
function linkText(a) {
  // text of the anchor excluding nested toggle widgets
  const clone = a.cloneNode(true);
  clone.querySelectorAll('div, button, img, span, svg').forEach((n) => n.remove());
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

function makeLink(document, a) {
  const text = linkText(a);
  if (!text) return null;
  const link = document.createElement('a');
  link.href = a.getAttribute('href') || a.href || '';
  link.textContent = text;
  return link;
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('li.horizontal-navigation__link')];
  if (!items.length) items = [...element.querySelectorAll('ul.bah-navigation__link-container > li')];

  const list = document.createElement('ul');
  items.forEach((li) => {
    const topAnchor = li.querySelector('a.horizontal-navigation__link-anchor')
      || li.querySelector('a:not(.horizontal-navigation__item-submenu-link)');
    const subAnchors = [...li.querySelectorAll(
      '.horizontal-navigation__sub-links a, a.horizontal-navigation__item-submenu-link',
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
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-subnav', cells });
  element.replaceWith(block);
}
