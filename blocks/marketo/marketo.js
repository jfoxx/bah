import { loadScript } from '../../scripts/aem.js';

function getFormProps(block) {
  const anchor = block.querySelector('a[href]');
  const url = new URL(anchor ? anchor.href : block.textContent.trim());
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('Marketo form URL must use HTTPS');
  }
  const munchkinId = url.searchParams.get('munchkinId') || '';
  const formId = /^#\/ds\/mktform\/(\d+)\/?$/.exec(url.hash)?.[1]
    || url.searchParams.get('formId') || '';
  if (!/^\d{3}-[A-Z]{3}-\d{3}$/i.test(munchkinId)
    || !/^[1-9]\d*$/.test(formId)) {
    throw new Error('Invalid Marketo form configuration');
  }
  let baseUrl = url.origin;
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2 || cells[0].textContent.trim().toLowerCase() !== 'base url') return;
    const value = cells[1].querySelector('a[href]')?.href || cells[1].textContent.trim();
    const base = new URL(value);
    if (base.protocol !== 'https:' || base.username || base.password) {
      throw new Error('Marketo Base URL must use HTTPS');
    }
    baseUrl = base.origin;
  });
  return { munchkinId, formId, baseUrl };
}

function showError(block) {
  block.classList.remove('marketo-loading');
  block.removeAttribute('aria-busy');
  const message = document.createElement('p');
  message.setAttribute('role', 'status');
  message.textContent = 'The form could not be loaded. Please try again later.';
  block.replaceChildren(message);
}

export default async function decorate(block) {
  try {
    const { munchkinId, formId, baseUrl } = getFormProps(block);
    const form = document.createElement('form');
    form.id = `mktoForm_${formId}`;
    block.replaceChildren(form);
    block.classList.add('marketo-loading');
    block.setAttribute('aria-busy', 'true');
    if (!window.MktoForms2) await loadScript(`${baseUrl}/js/forms2/js/forms2.min.js`);
    if (!window.MktoForms2) throw new Error('MktoForms2 unavailable');
    window.MktoForms2.loadForm(baseUrl, munchkinId, Number(formId), () => {
      block.classList.remove('marketo-loading');
      block.removeAttribute('aria-busy');
    });
  } catch {
    showError(block);
  }
}
