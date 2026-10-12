/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-backdrop. Base: columns.
 * Source: https://www.boozallen.com/expertise/artificial-intelligence.html
 * Selector: .aem-Grid:has(> .big_hero) > .grid-layout__wrapper > .grid-layout
 *   .grid-layout__row ... .column_bah > .column-bah.row > .large-6.columns (x2)
 *     one column holds the text (.title h5/h2, .text p), the other is EMPTY
 *     (the empty half is where the backdrop image shows through)
 *   .grid-layout__background .background-image picture > img   (backdrop image)
 * Instance rc5: text | empty  -> | H2, paragraph | image |
 * Instance rc8: empty | text  -> | image | H5, H2, paragraph |
 * Output: 1 row x 2 columns; the image takes the empty column's position so the
 * block JS can read the text side from the cell order (blocks/columns-backdrop).
 * boozallen-cleanup removes .grid-layout__background after parsing, so the image
 * is moved into the block here.
 *
 * Also: https://www.boozallen.com/markets/defense/ai-for-military.html
 * Selector: ... generic_block:nth-of-type(4) > div
 *   div.generic-block.generic-block-image.black.generic-block-image__wrapper--force-full (empty)
 *   div.generic-block.generic-block-image.black
 *       style="background-image: url(\2f content\2f dam\2f ... soldier-in-field.png.img.jpeg)"
 *     .column_bah .column-bah > .large-6.columns (x2): H3, p, .button-wrapper a.button | empty
 * The backdrop is an INLINE-STYLE background (stripped from cleaned.html, present in the
 * live DOM): read from style/computed style and emitted as an <img> with an absolute
 * boozallen.com URL. Text left -> | H3, paragraph, Watch Now | image |, with the
 * "dark" option (black band) -> "Columns Backdrop (dark)". Expertise instances: no option.
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

function collectContent(column) {
  const matches = [...column.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, a.button')];
  return matches
    .filter((el) => !matches.some((o) => o !== el && o.contains(el)))
    .filter((el) => el.textContent.trim());
}

export default function parse(element, { document }) {
  // defense/market pages: generic-block band with an inline-style background image
  const genericBlocks = [...element.querySelectorAll('.generic-block-image')];
  if (element.matches('.generic-block-image')) genericBlocks.unshift(element);
  const isGenericBlock = genericBlocks.length > 0;
  const isDark = isGenericBlock && genericBlocks.some((b) => b.classList.contains('black'));

  let bgImg = element.querySelector('.grid-layout__background .background-image img')
    || element.querySelector('.grid-layout__background picture img')
    || element.querySelector('.grid-layout__background img:not([src^="data:"])');
  if (!bgImg && isGenericBlock) {
    for (const b of genericBlocks) {
      bgImg = imageFromBackground(b, document);
      if (bgImg) break;
    }
  }

  let columns = [...element.querySelectorAll('.column-bah > .columns')];
  if (!columns.length) columns = [...element.querySelectorAll('.column_bah .columns[class*="large-"]')];

  const contents = columns.map((col) => collectContent(col));
  const textIdx = contents.findIndex((c) => c.length);

  if (textIdx < 0 && !bgImg) {
    element.replaceWith(...element.childNodes);
    return;
  }

  let row;
  if (textIdx < 0) {
    row = [bgImg];
  } else if (!bgImg) {
    row = [contents[textIdx]];
  } else {
    // image takes the position of the first empty column; default after the text
    const emptyIdx = contents.findIndex((c) => !c.length);
    const imageFirst = emptyIdx >= 0 && emptyIdx < textIdx;
    row = imageFirst ? [bgImg, contents[textIdx]] : [contents[textIdx], bgImg];
  }

  const cells = [row];
  const variants = isDark ? ['dark'] : [];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-backdrop', variants, cells });
  element.replaceWith(block);
}
