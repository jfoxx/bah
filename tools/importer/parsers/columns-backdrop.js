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
 */
function collectContent(column) {
  const matches = [...column.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, a.button')];
  return matches
    .filter((el) => !matches.some((o) => o !== el && o.contains(el)))
    .filter((el) => el.textContent.trim());
}

export default function parse(element, { document }) {
  const bgImg = element.querySelector('.grid-layout__background .background-image img')
    || element.querySelector('.grid-layout__background picture img')
    || element.querySelector('.grid-layout__background img:not([src^="data:"])');

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
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-backdrop', cells });
  element.replaceWith(block);
}
