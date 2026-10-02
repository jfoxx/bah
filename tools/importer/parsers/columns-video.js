/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-video. Base: columns.
 * Source: https://www.boozallen.com/expertise/artificial-intelligence.html
 * Selector: .aem-Grid:has(> .big_hero) > :nth-child(3) .column_bah
 *   .column-bah.row > .large-6.columns (x2)
 *     column 1: .title h2, .text p (intro), .text p > img (logo)
 *     column 2: .video .embed-vbrick iframe[src*="vbrick.com/embed"],
 *               .reveal_box .reveal-box-title (label) + .reveal-box-content p (transcript)
 * Output: 1 row x 2 columns:
 *   cell 1 = H2, paragraph(s), logo image
 *   cell 2 = link to the video embed URL, transcript label paragraph, transcript paragraph(s)
 * The iframe is converted into a link here because boozallen-cleanup removes all
 * iframes after parsing.
 */
function textContentOf(column) {
  const matches = [...column.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, picture, img')];
  return matches
    .filter((el) => !matches.some((o) => o !== el && o.contains(el)))
    .filter((el) => el.querySelector('img, picture') || el.matches('img, picture') || el.textContent.trim());
}

export default function parse(element, { document }) {
  let columns = [...element.querySelectorAll(':scope > .column-bah > .columns, :scope > .row > .columns')]
    .filter((c, i, arr) => arr.indexOf(c) === i);
  if (!columns.length) columns = [...element.querySelectorAll('.columns[class*="large-"]')];

  const videoColumn = columns.find((c) => c.querySelector('.video, iframe, .reveal_box'));
  const textColumns = columns.filter((c) => c !== videoColumn);

  // Text cell(s)
  const textCells = textColumns.map((col) => textContentOf(col)).filter((cell) => cell.length);

  // Video cell
  const videoCell = [];
  if (videoColumn) {
    const iframe = videoColumn.querySelector('.embed-vbrick iframe, iframe[src*="vbrick"], iframe[src]');
    const src = iframe && iframe.getAttribute('src');
    if (src) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = src;
      a.textContent = src;
      p.append(a);
      videoCell.push(p);
    }
    const label = videoColumn.querySelector('.reveal-box-title');
    if (label && label.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = label.textContent.trim();
      videoCell.push(p);
    }
    const transcript = [...videoColumn.querySelectorAll('.reveal-box-content p, .reveal-box-content ul, .reveal-box-content ol')]
      .filter((el, i, arr) => !arr.some((o) => o !== el && o.contains(el)))
      .filter((el) => el.textContent.trim());
    videoCell.push(...transcript);
  }

  if (!textCells.length && !videoCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Preserve source column order
  const row = [];
  columns.forEach((col) => {
    if (col === videoColumn) {
      if (videoCell.length) row.push(videoCell);
    } else {
      const cell = textContentOf(col);
      if (cell.length) row.push(cell);
    }
  });

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-video', cells });
  element.replaceWith(block);
}
