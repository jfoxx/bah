/*
 * Cards Listing block (dynamic)
 * Fetches a query index and renders a year filter, a paged list of
 * image-left cards (title link, date, excerpt, tag pill) and a pager.
 *
 * Authoring (config rows, all optional):
 *   | Cards Listing                        |
 *   | /news-releases/query-index.json      |  <- link to the query index
 *   | Tag        | Press Release           |
 *   | Page Size  | 10                      |
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

const DEFAULT_INDEX = '/news-releases/query-index.json';
const DEFAULT_TAG = 'Press Release';
const DEFAULT_PAGE_SIZE = 10;
const FETCH_LIMIT = 500;
const MAX_FETCHES = 50;
const PAGER_WINDOW = 3;

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

let instanceCount = 0;

function normalizeKey(text) {
  return (text || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

/**
 * Convert absolute aem.live / aem.page (or same-origin) URLs to a path so
 * requests stay on the current host and avoid CORS.
 */
function toLocalPath(href) {
  if (!href) return '';
  try {
    const url = new URL(href, window.location.href);
    const sameOrigin = url.origin === window.location.origin;
    if (sameOrigin || /\.aem\.(live|page)$/.test(url.hostname)) {
      return `${url.pathname}${url.search}`;
    }
    return url.href;
  } catch (e) {
    return href;
  }
}

function readConfig(block) {
  const config = { index: '', tag: '', pageSize: 0 };
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;
    const link = row.querySelector('a[href]');
    if (cells.length >= 2) {
      const key = normalizeKey(cells[0].textContent);
      const value = cells[1].textContent.trim();
      if (key === 'tag') config.tag = value;
      else if (key === 'pagesize') config.pageSize = parseInt(value, 10);
      else if (!config.index && (link || /\.json/.test(value))) {
        config.index = link ? link.getAttribute('href') : value;
      }
      return;
    }
    if (!config.index) {
      const text = cells[0].textContent.trim();
      if (link) config.index = link.getAttribute('href');
      else if (/\.json/.test(text)) config.index = text;
    }
  });
  return {
    index: toLocalPath(config.index) || DEFAULT_INDEX,
    tag: config.tag || DEFAULT_TAG,
    pageSize: Number.isInteger(config.pageSize) && config.pageSize > 0
      ? config.pageSize : DEFAULT_PAGE_SIZE,
  };
}

/** Parse DD-MM-YYYY into a UTC Date, or null when invalid. */
function parseReleaseDate(value) {
  const match = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec((value || '').trim());
  if (!match) return null;
  const [, d, m, y] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return null;
  }
  return date;
}

async function fetchAll(indexPath) {
  const rows = [];
  let offset = 0;
  let total = Infinity;
  for (let i = 0; i < MAX_FETCHES && offset < total; i += 1) {
    const url = new URL(indexPath, window.location.href);
    url.searchParams.set('offset', offset);
    url.searchParams.set('limit', FETCH_LIMIT);
    // eslint-disable-next-line no-await-in-loop
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Index request failed: ${resp.status}`);
    // eslint-disable-next-line no-await-in-loop
    const json = await resp.json();
    const data = Array.isArray(json.data) ? json.data : [];
    rows.push(...data);
    total = Number.isFinite(json.total) ? json.total : rows.length;
    if (!data.length) break;
    offset += data.length;
  }
  return rows;
}

function prepareRows(rows) {
  return rows
    .filter((row) => row && row.path && row.title)
    .map((row) => {
      const date = parseReleaseDate(row.releaseDate);
      return {
        path: row.path,
        title: row.title,
        description: (row.description || '').replace(/^[\s\-–—]+/, '').trim(),
        image: row.image || '',
        date,
        year: date ? String(date.getUTCFullYear()) : '',
      };
    })
    .sort((a, b) => {
      if (a.date && b.date) return b.date - a.date;
      if (a.date) return -1;
      if (b.date) return 1;
      return 0;
    });
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== false) node.setAttribute(k, v);
  });
  node.append(...children.filter((c) => c !== null && c !== undefined));
  return node;
}

function excerpt(text) {
  if (!text) return '';
  return /[.!?…]$/.test(text) ? text : `${text} …`;
}

function buildItem(item, tag) {
  const li = el('li', { class: 'cards-listing-item' });
  const media = el('div', { class: 'cards-listing-item-image' });
  const imagePath = toLocalPath(item.image);
  if (imagePath) {
    const picture = createOptimizedPicture(imagePath, '', false, [
      { media: '(min-width: 900px)', width: '600' },
      { width: '750' },
    ]);
    const link = el('a', { href: item.path, tabindex: '-1', 'aria-hidden': 'true' }, picture);
    media.append(link);
  }
  const body = el(
    'div',
    { class: 'cards-listing-item-body' },
    el('h2', { class: 'cards-listing-item-title' }, el('a', { href: item.path }, item.title)),
    item.date
      ? el('p', { class: 'cards-listing-item-date' }, el('time', { datetime: item.date.toISOString().slice(0, 10) }, DATE_FORMAT.format(item.date)))
      : null,
    item.description ? el('p', { class: 'cards-listing-item-description' }, excerpt(item.description)) : null,
    tag ? el('p', { class: 'cards-listing-item-tag' }, el('span', {}, tag)) : null,
  );
  li.append(media, body);
  return li;
}

/** Page numbers to show: a small window around the current page. */
function pageWindow(current, totalPages) {
  let start = Math.max(1, current - Math.floor(PAGER_WINDOW / 2));
  const end = Math.min(totalPages, start + PAGER_WINDOW - 1);
  start = Math.max(1, end - PAGER_WINDOW + 1);
  const pages = [];
  for (let p = start; p <= end; p += 1) pages.push(p);
  return pages;
}

function readState(years) {
  const params = new URLSearchParams(window.location.search);
  const year = params.get('year') || '';
  const page = parseInt(params.get('page'), 10);
  return {
    year: years.includes(year) ? year : '',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

function writeState(state) {
  const url = new URL(window.location.href);
  if (state.page > 1) url.searchParams.set('page', state.page);
  else url.searchParams.delete('page');
  if (state.year) url.searchParams.set('year', state.year);
  else url.searchParams.delete('year');
  window.history.replaceState(window.history.state, '', url);
}

function pageHref(page, year) {
  const url = new URL(window.location.href);
  url.searchParams.set('page', page);
  if (year) url.searchParams.set('year', year);
  else url.searchParams.delete('year');
  return `${url.pathname}${url.search}`;
}

function render(block, items, config) {
  instanceCount += 1;
  const id = `cards-listing-${instanceCount}`;
  const years = [...new Set(items.map((i) => i.year).filter(Boolean))].sort((a, b) => b - a);
  const state = readState(years);

  // filter
  const select = el('select', { id: `${id}-year`, name: 'year' }, el('option', { value: '' }, 'All'));
  years.forEach((y) => select.append(el('option', { value: y }, y)));
  select.value = state.year;
  const form = el(
    'form',
    { class: 'cards-listing-filter' },
    el('div', { class: 'cards-listing-filter-field' }, el('label', { for: `${id}-year` }, 'Year'), select),
    el('button', { type: 'submit', class: 'cards-listing-filter-button' }, 'Filter'),
  );

  const list = el('ul', { class: 'cards-listing-list', id: `${id}-list`, tabindex: '-1' });
  const summary = el('p', { class: 'cards-listing-summary', 'aria-live': 'polite' });
  const pagerList = el('ul', { class: 'cards-listing-pager-list' });
  const nav = el('nav', { class: 'cards-listing-pager', 'aria-label': 'Pagination' }, pagerList);
  const footer = el('div', { class: 'cards-listing-footer' }, nav, summary);

  const update = (focusList) => {
    const filtered = state.year ? items.filter((i) => i.year === state.year) : items;
    const totalPages = Math.max(1, Math.ceil(filtered.length / config.pageSize));
    state.page = Math.min(Math.max(1, state.page), totalPages);
    const startIdx = (state.page - 1) * config.pageSize;
    const pageItems = filtered.slice(startIdx, startIdx + config.pageSize);

    list.replaceChildren(...pageItems.map((item) => buildItem(item, config.tag)));
    if (!pageItems.length) {
      list.append(el('li', { class: 'cards-listing-empty' }, 'No results found.'));
    }

    summary.textContent = filtered.length
      ? `Displaying ${startIdx + 1} - ${startIdx + pageItems.length} of ${filtered.length}`
      : 'Displaying 0 of 0';

    const links = [];
    const addLink = (page, label, cls, ariaLabel) => {
      const current = page === state.page && cls === 'cards-listing-pager-page';
      const a = el('a', {
        class: 'cards-listing-pager-link',
        href: pageHref(page, state.year),
        'data-page': page,
        'aria-label': ariaLabel,
        'aria-current': current ? 'page' : null,
      }, label);
      links.push(el('li', { class: cls }, a));
    };
    if (totalPages > 1) {
      if (state.page > 1) {
        addLink(1, '«', 'cards-listing-pager-first', 'First page');
        addLink(state.page - 1, '‹', 'cards-listing-pager-prev', 'Previous page');
      }
      const pages = pageWindow(state.page, totalPages);
      if (pages[0] > 1) links.push(el('li', { class: 'cards-listing-pager-ellipsis', 'aria-hidden': 'true' }, '…'));
      pages.forEach((p) => addLink(p, String(p), 'cards-listing-pager-page', `Page ${p}`));
      if (pages[pages.length - 1] < totalPages) links.push(el('li', { class: 'cards-listing-pager-ellipsis', 'aria-hidden': 'true' }, '…'));
      if (state.page < totalPages) {
        addLink(state.page + 1, '›', 'cards-listing-pager-next', 'Next page');
        addLink(totalPages, '»', 'cards-listing-pager-last', 'Last page');
      }
    }
    pagerList.replaceChildren(...links);
    nav.hidden = totalPages <= 1;

    writeState(state);
    if (focusList) list.focus({ preventScroll: false });
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.year = select.value;
    state.page = 1;
    update(true);
  });

  nav.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-page]');
    if (!link) return;
    e.preventDefault();
    state.page = parseInt(link.dataset.page, 10) || 1;
    update(true);
  });

  block.replaceChildren(form, list, footer);
  update(false);
}

export default async function decorate(block) {
  const config = readConfig(block);
  const status = el('p', { class: 'cards-listing-status', role: 'status' }, 'Loading…');
  block.replaceChildren(status);

  try {
    const rows = await fetchAll(config.index);
    render(block, prepareRows(rows), config);
  } catch (e) {
    status.textContent = 'Sorry, the list could not be loaded. Please try again later.';
    block.classList.add('cards-listing-error');
  }
}
