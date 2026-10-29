/*
 * Embed Marketo block
 * Renders a hosted Marketo form. The Marketo forms2 script is loaded lazily, only when the
 * block nears the viewport. The heading/intro above the form is default content.
 *
 * Authoring - key/value rows (any order, keys are case-insensitive):
 *   | Embed Marketo |                              |
 *   | Form ID       | 1205                         |
 *   | Munchkin ID   | 516-JQG-021   (optional)     |
 *   | Base URL      | https://pages.boozallen.com  (link, optional) |
 * or a single cell with a link to the Marketo instance and the form id:
 *   | https://pages.boozallen.com  1205 |
 */

const OPTION_CLASSES = [];

const DEFAULT_BASE_URL = 'https://pages.boozallen.com';
const DEFAULT_MUNCHKIN_ID = '516-JQG-021';
const SCRIPT_PATH = '/js/forms2/js/forms2.min.js';

const MUNCHKIN_RE = /\b(\d{3}-[A-Z]{3}-\d{3})\b/i;
const FORM_ID_RE = /\b(\d{2,})\b/;

const scriptPromises = {};

function loadForms2(baseUrl) {
  const src = `${baseUrl}${SCRIPT_PATH}`;
  if (window.MktoForms2) return Promise.resolve(window.MktoForms2);
  if (!scriptPromises[src]) {
    scriptPromises[src] = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => (window.MktoForms2 ? resolve(window.MktoForms2) : reject(new Error('MktoForms2 unavailable')));
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.append(script);
    });
  }
  return scriptPromises[src];
}

function toOrigin(href) {
  try {
    return new URL(href, window.location.href).origin;
  } catch {
    return '';
  }
}

function formIdFromLink(href) {
  // e.g. ...?formId=1205, #mktoForm_1205, /form/1205
  const m = href.match(/(?:formid=|mktoForm_|\/form\/)(\d+)/i);
  return m ? m[1] : '';
}

/**
 * Reads the form configuration from key/value rows or free-form cells.
 * @param {Element} block
 * @returns {{ baseUrl: string, munchkinId: string, formId: string, link: string }}
 */
function readConfig(block) {
  const config = {
    baseUrl: '', munchkinId: '', formId: '', link: '',
  };

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const key = cells.length > 1 ? cells[0].textContent.trim().toLowerCase() : '';
    const valueCell = cells.length > 1 ? cells[cells.length - 1] : cells[0];
    if (!valueCell) return;
    const anchor = valueCell.querySelector('a[href]');
    const text = valueCell.textContent.trim();

    if (key.includes('munchkin')) {
      config.munchkinId = (text.match(MUNCHKIN_RE) || [])[1] || text;
    } else if (key.includes('form')) {
      config.formId = (text.match(FORM_ID_RE) || [])[1] || (anchor ? formIdFromLink(anchor.href) : '');
    } else if (key && (key.includes('url') || key.includes('base') || key.includes('instance') || key.includes('script'))) {
      config.baseUrl = toOrigin(anchor ? anchor.href : text);
    } else {
      // free-form row: link to the Marketo instance and/or the bare ids, in any cell
      const rowAnchor = row.querySelector('a[href]');
      if (rowAnchor) {
        config.link = config.link || rowAnchor.href;
        config.baseUrl = config.baseUrl || toOrigin(rowAnchor.href);
        config.formId = config.formId || formIdFromLink(rowAnchor.href);
      }
      const plain = [...row.querySelectorAll('a')]
        .reduce((t, a) => t.replace(a.textContent, ' '), row.textContent);
      const [, munchkin] = plain.match(MUNCHKIN_RE) || [];
      if (munchkin && !config.munchkinId) config.munchkinId = munchkin;
      const [, id] = plain.replace(MUNCHKIN_RE, ' ').match(FORM_ID_RE) || [];
      if (id && !config.formId) config.formId = id;
    }
  });

  config.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  config.munchkinId = config.munchkinId || DEFAULT_MUNCHKIN_ID;
  return config;
}

function showFallback(block, config) {
  block.classList.add('embed-marketo-error');
  const p = document.createElement('p');
  p.className = 'embed-marketo-fallback';
  if (config.link) {
    const a = document.createElement('a');
    a.href = config.link;
    a.textContent = 'Open the form';
    p.append(a);
  } else {
    p.textContent = 'The form could not be loaded.';
  }
  block.querySelector('.embed-marketo-form')?.replaceWith(p);
}

/**
 * Disables the Marketo forms2 base/theme stylesheets and the form's own injected styles,
 * so the block CSS alone controls the presentation (matching the source site).
 * @param {Element} block
 */
function destyleForm(block) {
  document.querySelectorAll('link#mktoForms2BaseStyle, link#mktoForms2ThemeStyle, link[href*="/js/forms2/css/"]')
    .forEach((link) => { link.disabled = true; });
  [...document.querySelectorAll('style'), ...block.querySelectorAll('style')]
    .filter((style) => style.textContent.includes('.mktoForm'))
    .forEach((style) => { style.disabled = true; });
}

function renderForm(block, config) {
  block.classList.add('embed-marketo-loading');
  loadForms2(config.baseUrl)
    .then((MktoForms2) => {
      MktoForms2.loadForm(config.baseUrl, config.munchkinId, Number(config.formId), () => {
        destyleForm(block);
        block.classList.remove('embed-marketo-loading');
        block.classList.add('embed-marketo-loaded');
      });
    })
    .catch(() => {
      block.classList.remove('embed-marketo-loading');
      showFallback(block, config);
    });
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  const config = readConfig(block);
  block.replaceChildren();

  if (!config.formId) {
    showFallback(block, config);
    return;
  }

  block.dataset.formId = config.formId;
  const form = document.createElement('form');
  form.id = `mktoForm_${config.formId}`;
  form.className = 'embed-marketo-form';
  block.append(form);

  if (!('IntersectionObserver' in window)) {
    renderForm(block, config);
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      renderForm(block, config);
    }
  }, { rootMargin: '300px 0px' });
  observer.observe(block);
}
