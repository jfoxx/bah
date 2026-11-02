const FORMS_ORIGIN = 'https://pages.marketolive.com';
const MUNCHKIN_ID = '185-NGX-811';
const DATA_URL = new URL('./forms.json', import.meta.url);

const list = document.querySelector('#forms');
const query = document.querySelector('#query');
const count = document.querySelector('#count');
const empty = document.querySelector('#empty');
const catalog = document.querySelector('.catalog');
const refresh = document.querySelector('#refresh');
const selection = document.querySelector('#selection');
const urlInput = document.querySelector('#form-url');
const message = document.querySelector('#message');
let forms = [];
let selected = null;

function formUrl(form) {
  const url = new URL(FORMS_ORIGIN);
  url.searchParams.set('munchkinId', MUNCHKIN_ID);
  url.searchParams.set('formId', form.id);
  return url.href;
}

async function copyUrl() {
  if (!selected) return;
  const current = selected;
  const value = formUrl(current);
  let copied = false;
  try {
    await navigator.clipboard.writeText(value);
    copied = true;
  } catch {
    urlInput.focus();
    urlInput.select();
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }
  }
  if (selected !== current) return;
  message.textContent = copied
    ? `Copied URL for ${current.name}.`
    : 'Clipboard unavailable. The Form URL is selected for manual copying.';
}

function selectForm(form) {
  selected = form;
  selection.hidden = false;
  document.querySelector('#selected-name').textContent = form.name;
  document.querySelector('#selected-description').textContent = form.description || '';
  urlInput.value = formUrl(form);
  message.textContent = '';
  copyUrl();
}

function render() {
  const term = query.value.trim().toLowerCase();
  const matches = forms.filter((form) => [
    form.name, String(form.id), form.description, form.folder?.folderName,
  ].some((value) => value?.toLowerCase().includes(term)));
  const items = matches.map((form) => {
    const item = document.createElement('li');
    const label = document.createElement('label');
    label.className = 'form-option';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'form';
    radio.value = form.id;
    radio.checked = selected?.id === form.id;
    radio.addEventListener('change', () => selectForm(form));
    const content = document.createElement('span');
    content.className = 'form-content';
    const name = document.createElement('span');
    name.className = 'form-name';
    name.textContent = form.name;
    const details = document.createElement('span');
    details.className = 'form-details';
    details.textContent = `#${form.id} / ${form.folder?.folderName || 'Unfiled'}`;
    const status = document.createElement('span');
    status.className = 'form-status';
    status.textContent = form.status || 'Unknown';
    content.append(name, details);
    label.append(radio, content, status);
    item.append(label);
    return item;
  });
  list.replaceChildren(...items);
  count.textContent = `${matches.length} of ${forms.length} forms`;
  empty.hidden = matches.length > 0;
  empty.textContent = forms.length ? 'No matching forms.' : 'No forms available.';
}

async function loadForms() {
  refresh.disabled = true;
  query.disabled = true;
  catalog.setAttribute('aria-busy', 'true');
  count.textContent = 'Loading forms...';
  message.textContent = '';
  try {
    const response = await fetch(DATA_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error('Forms request failed');
    const payload = await response.json();
    if (payload.success !== true || !Array.isArray(payload.result)) {
      throw new Error('Invalid forms response');
    }
    if (payload.result.some((form) => !Number.isSafeInteger(form.id)
      || form.id <= 0 || typeof form.name !== 'string')) {
      throw new Error('Invalid form record');
    }
    forms = payload.result;
    selected = null;
    selection.hidden = true;
    urlInput.value = '';
    render();
  } catch {
    forms = [];
    selected = null;
    selection.hidden = true;
    list.replaceChildren();
    empty.hidden = false;
    empty.textContent = 'Forms could not be loaded.';
    count.textContent = 'Unavailable';
    message.textContent = 'Refresh to try again.';
  } finally {
    catalog.setAttribute('aria-busy', 'false');
    refresh.disabled = false;
    query.disabled = false;
  }
}

query.addEventListener('input', render);
refresh.addEventListener('click', loadForms);
document.querySelector('#copy').addEventListener('click', copyUrl);
loadForms();
