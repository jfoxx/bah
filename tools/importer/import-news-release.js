/* eslint-disable */
/* global WebImporter */

// Maps a source NIR news-release page to the EDS `news-release` template.
// Source is a Drupal NIR detail page:
//   .field--name-field-nir-news-title     -> H1 / Title
//   .field--name-field-nir-news-date       -> release-date (DD-MM-YYYY)
//   .field--name-field-nir-news-thumbnail  -> og:image (Metadata Image)
//   .full-release-body                     -> body; first <p> carries a
//                                             "<strong>City</strong>—<strong>Date</strong>—" dateline prefix

const MONTHS = {
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
};

// "August 24, 2026" -> "24-08-2026" (DD-MM-YYYY, as the template expects)
function toReleaseDate(text) {
  if (!text) return '';
  const clean = text.replace(/\u00a0/g, ' ').trim();
  const m = /([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/.exec(clean);
  if (!m) return '';
  const mm = MONTHS[m[1].toLowerCase()];
  if (!mm) return '';
  return `${String(m[2]).padStart(2, '0')}-${mm}-${m[3]}`;
}

// Strong-only boilerplate headings -> shared fragment URLs (matched case-insensitively).
const BOILERPLATE_FRAGMENTS = {
  'about booz allen': 'https://main--bah--jfoxx.aem.page/news-releases/fragments/about-booz-allen',
  'about booz allen hamilton': 'https://main--bah--jfoxx.aem.page/news-releases/fragments/about-booz-allen',
  'forward-looking statements': 'https://main--bah--jfoxx.aem.page/news-releases/fragments/forward-looking-statements',
  'forward looking statements': 'https://main--bah--jfoxx.aem.page/news-releases/fragments/forward-looking-statements',


};

function createFragmentBlock(document, fragmentUrl) {
  const table = document.createElement('table');
  const head = document.createElement('tr');
  const th = document.createElement('th');
  th.textContent = 'Fragment';
  head.append(th);
  table.append(head);
  const tr = document.createElement('tr');
  const td = document.createElement('td');
  const link = document.createElement('a');
  link.href = fragmentUrl;
  link.textContent = fragmentUrl;
  td.append(link);
  tr.append(td);
  table.append(tr);
  return table;
}

// Replaces each boilerplate section with a Fragment block. A "section" starts
// with a paragraph whose leading <strong> names the section (the body text
// follows inline after a <br>) and runs until the next such heading. No-op for
// headings without a mapped fragment; unmapped headings (e.g. "Contacts") act
// as boundaries and are preserved.
function replaceBoilerplateWithFragments(document, container) {
  const norm = (s) => s.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  const headingText = (el) => {
    if (!el || el.tagName !== 'P') return null;
    const strong = el.firstElementChild;
    if (!strong || strong.tagName !== 'STRONG') return null;
    const label = norm(strong.textContent);
    if (!label || !norm(el.textContent).startsWith(label)) return null;
    return label;
  };

  [...container.querySelectorAll(':scope > p')].forEach((heading) => {
    const label = headingText(heading);
    if (!label) return;
    const fragmentUrl = BOILERPLATE_FRAGMENTS[label.toLowerCase()];
    if (!fragmentUrl) return;

    const group = [];
    let node = heading.nextElementSibling;
    while (node) {
      if (headingText(node)) break;
      group.push(node);
      node = node.nextElementSibling;
    }
    heading.replaceWith(createFragmentBlock(document, fragmentUrl));
    group.forEach((el) => el.remove());
  });
}

function createMetadataBlock(document, data) {
  const table = document.createElement('table');
  const head = document.createElement('tr');
  const th = document.createElement('th');
  th.setAttribute('colspan', '2');
  th.textContent = 'Metadata';
  head.append(th);
  table.append(head);
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    const tr = document.createElement('tr');
    const k = document.createElement('td');
    k.textContent = key;
    const v = document.createElement('td');
    if (typeof value === 'string') v.textContent = value;
    else v.append(value);
    tr.append(k, v);
    table.append(tr);
  });
  return table;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const source = params.originalURL || url;

    const title = document.querySelector('.field--name-field-nir-news-title')?.textContent.trim()
      || document.querySelector('h1')?.textContent.trim()
      || document.title.trim();

    const dateText = document.querySelector('.field--name-field-nir-news-date')?.textContent.trim() || '';
    const releaseDate = toReleaseDate(dateText);

    // thumbnail -> og:image (absolute so the importer can download it)
    let image;
    const thumb = document.querySelector('.field--name-field-nir-news-thumbnail img');
    const thumbSrc = thumb?.getAttribute('src');
    if (thumbSrc) {
      image = document.createElement('img');
      image.src = new URL(thumbSrc, source).href;
    }

    // body: clone, drop the inline thumbnail, strip the dateline prefix
    const content = document.createElement('div');
    let dateline = '';
    const body = document.querySelector('.full-release-body');
    if (body) {
      const clone = body.cloneNode(true);
      clone.querySelector('.field--name-field-nir-news-thumbnail')?.closest('.mb-5')?.remove();
      clone.querySelectorAll('.field--name-field-nir-news-thumbnail').forEach((el) => el.remove());

      const firstP = clone.querySelector('p');
      if (firstP) {
        const strongs = firstP.querySelectorAll(':scope > strong');
        if (strongs.length) dateline = strongs[0].textContent.replace(/\u00a0/g, ' ').trim();
        // remove leading <strong> (city, date) nodes and dash separators
        let node = firstP.firstChild;
        while (node) {
          const next = node.nextSibling;
          if (node.nodeType === 1 && node.tagName === 'STRONG') { node.remove(); node = next; continue; }
          if (node.nodeType === 3 && /^[\s\u00a0\-–—]*$/.test(node.textContent)) { node.remove(); node = next; continue; }
          break;
        }
        while (firstP.firstChild && firstP.firstChild.nodeType === 3 && !firstP.firstChild.textContent.trim()) {
          firstP.firstChild.remove();
        }
      }
      [...clone.childNodes].forEach((n) => content.append(n));
    }

    // swap trailing boilerplate sections for shared fragments
    replaceBoilerplateWithFragments(document, content);

    const main = document.createElement('div');
    const h1 = document.createElement('h1');
    h1.textContent = title;
    main.append(h1, content);

    const description = content.querySelector('p')?.textContent.replace(/\s+/g, ' ').trim().slice(0, 160) || '';

    const meta = {
      Title: title,
      Description: description,
      Template: 'news-release',
      'release-date': releaseDate,
      dateline,
    };
    if (image) meta.Image = image;
    main.append(createMetadataBlock(document, meta));

    // /news-releases/news-release-details/<slug> -> /news-releases/<slug>
    const srcPath = new URL(source).pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    const slug = srcPath.split('/').filter(Boolean).pop();
    const path = WebImporter.FileUtils.sanitizePath(`/news-releases/${slug}`);

    return [{
      element: main,
      path,
      report: {
        title,
        template: 'news-release',
        releaseDate,
        dateline,
      },
    }];
  },
};
