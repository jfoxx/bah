/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed-marketo. Base: embed (custom block - not the library video/social embed:
 * blocks/embed-marketo/embed-marketo.js reads key/value configuration rows, not a URL cell).
 * Source: https://www.boozallen.com/markets/defense/ai-for-military.html
 * Selector: ... generic_block:nth-of-type(6) .marketo_form
 *   .marketo_form > noindex > .marketo-form-wrapper
 *     .marketo-form__content#mktoForm_1205--content
 *       .title h3 ("Want More Information?")          -> default content BEFORE the block
 *       .text .cmp-text p ("Sign up to receive ...")  -> default content BEFORE the block
 *     form#mktoForm_1205.mktoForm[data-form-id="1205"][data-munchkin-id="516-JQG-021"]
 *       [data-script-url="https://pages.boozallen.com/js/forms2/js/forms2.min.js"]
 *     #thankYouXF-1205 (hidden post-submit thank-you fragment)  -> dropped
 * Everything sits inside <noindex>, which boozallen-cleanup removes after parsing, so
 * the heading + intro are moved out in front of .marketo_form (outside the noindex) and
 * the whole .marketo_form (form, hidden success text, noindex) is replaced by the block.
 * Output, key/value rows:
 *   | Form ID | 1205 | / | Munchkin ID | 516-JQG-021 | / | Base URL | https://pages.boozallen.com |
 */
const DEFAULT_MUNCHKIN_ID = '516-JQG-021';
const DEFAULT_BASE_URL = 'https://pages.boozallen.com';

function originOf(url) {
  try {
    return new URL(url, 'https://www.boozallen.com').origin;
  } catch (e) {
    return '';
  }
}

export default function parse(element, { document }) {
  const form = element.querySelector('form.mktoForm, form[id^="mktoForm_"]');
  const contentWrap = element.querySelector('.marketo-form__content');

  // Form ID: data attribute, else the form / content-wrapper id (mktoForm_1205[--content])
  let formId = form ? (form.getAttribute('data-form-id') || '') : '';
  if (!formId) {
    const idSource = [form, contentWrap, element.querySelector('[id^="thankYouXF-"]')]
      .filter(Boolean).map((n) => n.id).join(' ');
    const m = idSource.match(/(?:mktoForm_|thankYouXF-)(\d+)/);
    if (m) [, formId] = m;
  }
  const munchkinId = (form && form.getAttribute('data-munchkin-id')) || DEFAULT_MUNCHKIN_ID;
  const scriptUrl = form && form.getAttribute('data-script-url');
  const baseUrl = (scriptUrl && originOf(scriptUrl)) || DEFAULT_BASE_URL;

  // Lead-in heading + intro text authored inside the Marketo component (never the
  // thank-you fragment or anything inside the form itself)
  const lead = [];
  if (contentWrap) {
    const nodes = [...contentWrap.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol')]
      .filter((n) => !n.closest('form, [id^="thankYouXF-"], .cmp-experiencefragment--marketo-submit'));
    nodes
      .filter((n) => !nodes.some((o) => o !== n && o.contains(n)))
      .filter((n) => n.textContent.trim())
      .forEach((n) => {
        if (/^H[1-6]$/.test(n.tagName)) {
          const h = document.createElement(n.tagName.toLowerCase());
          h.textContent = n.textContent.replace(/\s+/g, ' ').trim();
          lead.push(h);
        } else {
          lead.push(n);
        }
      });
  }

  if (!formId) {
    // no form configuration - keep only the authored lead-in text
    if (lead.length) element.replaceWith(...lead);
    else element.replaceWith(...element.childNodes);
    return;
  }

  const baseLink = document.createElement('a');
  baseLink.href = baseUrl;
  baseLink.textContent = baseUrl;

  const cells = [
    ['Form ID', formId],
    ['Munchkin ID', munchkinId],
    ['Base URL', baseLink],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-marketo', cells });
  // heading + intro become default content directly before the block (outside <noindex>)
  if (lead.length) element.before(...lead);
  element.replaceWith(block);
}
