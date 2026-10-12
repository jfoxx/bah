/*
 * Columns CTA block
 * A paragraph (3/4 column) beside a top-aligned call-to-action button (1/4 column).
 * The heading above is default content.
 *
 * Authoring (one row, two cells; cell order does not matter):
 *   | Columns CTA                                  |
 *   | paragraph text | **Explore Careers** (link)  |
 * The cell holding only link(s) becomes the CTA; any other cell is the text.
 */

const OPTION_CLASSES = [];

function isLinkOnly(cell) {
  const links = cell.querySelectorAll('a[href]');
  if (!links.length) return false;
  const rest = [...links].reduce((t, a) => t.replace(a.textContent, ''), cell.textContent);
  return !rest.trim();
}

function buttonize(cta) {
  cta.querySelectorAll('a[href]').forEach((a) => {
    if (a.classList.contains('button')) return;
    // plain (unformatted) links still render as a button here
    a.classList.add('button');
    let p = a.closest('p');
    if (!p || !cta.contains(p)) {
      p = document.createElement('p');
      a.replaceWith(p);
      p.append(a);
    }
    p.classList.add('button-wrapper');
  });
}

function decorateRow(row) {
  row.classList.add('columns-cta-row');
  const cells = [...row.children].filter((c) => c.textContent.trim() || c.querySelector('picture'));
  const ctaIdx = cells.findLastIndex(isLinkOnly);
  const text = document.createElement('div');
  text.className = 'columns-cta-text';
  cells.forEach((cell, i) => {
    if (i === ctaIdx) return;
    while (cell.firstChild) text.append(cell.firstChild);
  });

  row.replaceChildren();
  if (text.childNodes.length) row.append(text);
  if (ctaIdx >= 0) {
    const cta = cells[ctaIdx];
    cta.className = 'columns-cta-action';
    buttonize(cta);
    row.append(cta);
  } else {
    row.classList.add('columns-cta-no-action');
  }
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');
  [...block.children].forEach(decorateRow);
}
