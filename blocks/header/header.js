// media query match that indicates desktop width
const isDesktop = window.matchMedia('(width >= 900px)');

/**
 * Fetches the nav fragment: /content first (local preview), then root (DA/EDS).
 * @returns {Promise<{html: string, base: URL}|null>}
 */
async function fetchNav() {
  // metadata-independent: /content first (localhost), then root (DA/EDS prod)
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: new URL(resp.url, window.location.href) };
}

/**
 * Resolves relative image paths against the fragment location.
 * @param {Element} root fragment root
 * @param {URL} base fragment URL
 */
function resolveImages(root, base) {
  root.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!/^(https?:|data:|\/)/.test(src)) img.src = new URL(src, base).href;
  });
}

/**
 * Splits fragment sections by role.
 * @param {Element} root fragment root
 */
function classifySections(root) {
  const sections = [...root.children].filter((el) => el.tagName === 'DIV');
  const brand = sections[0];
  const menus = sections.filter((s) => s.querySelector(':scope > h2'));
  const rest = sections.slice(1).filter((s) => !menus.includes(s));
  const search = rest.find((s) => s.querySelector(':scope > p img'));
  const utilities = rest.find((s) => s !== search && s.querySelector(':scope > ul'));
  return {
    brand, menus, utilities, search,
  };
}

/**
 * Builds the hamburger toggle button.
 * @returns {HTMLButtonElement}
 */
function buildHamburger() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'nav-hamburger';
  button.setAttribute('aria-controls', 'nav-menu');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', 'Menu');
  button.innerHTML = '<span></span><span></span><span></span>';
  return button;
}

/**
 * Builds one menu section: sidebar tab, intro preview and link panel.
 * @param {Element} section fragment section (h2 + intro + column lists)
 * @param {number} index section index
 */
function buildMenuSection(section, index) {
  const heading = section.querySelector(':scope > h2');
  const headingLink = heading.querySelector('a');
  const label = heading.textContent.trim();
  const id = `nav-panel-${index}`;

  const tab = document.createElement('li');
  tab.className = 'nav-tab';
  const tabButton = document.createElement('button');
  tabButton.type = 'button';
  tabButton.setAttribute('aria-controls', id);
  tabButton.setAttribute('aria-expanded', 'false');
  tabButton.innerHTML = '<span class="nav-tab-label"></span><span class="nav-tab-chevron" aria-hidden="true"></span>';
  tabButton.querySelector('.nav-tab-label').textContent = label;
  tab.append(tabButton);

  const intro = document.createElement('div');
  intro.className = 'nav-intro';
  const introTitle = document.createElement('p');
  introTitle.className = 'nav-intro-title';
  introTitle.textContent = label;
  intro.append(introTitle);
  section.querySelectorAll(':scope > p').forEach((p) => intro.append(p));

  const panel = document.createElement('div');
  panel.className = 'nav-panel';
  panel.id = id;
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', label);
  const panelHeading = document.createElement('p');
  panelHeading.className = 'nav-panel-heading';
  panelHeading.append(headingLink || document.createTextNode(label));
  const columns = document.createElement('div');
  columns.className = 'nav-panel-columns';
  section.querySelectorAll(':scope > ul').forEach((ul) => {
    ul.classList.add('nav-panel-column');
    ul.querySelectorAll(':scope > li').forEach((li) => {
      li.classList.add('nav-group');
      const sub = li.querySelector(':scope > ul');
      if (sub) sub.classList.add('nav-group-links');
      // text-only group headings become labelled spans
      const textNodes = [...li.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      if (textNodes.length) {
        const span = document.createElement('span');
        span.className = 'nav-group-heading';
        span.textContent = textNodes.map((n) => n.textContent.trim()).join(' ');
        textNodes.forEach((n) => n.remove());
        li.prepend(span);
      } else {
        li.querySelector(':scope > a')?.classList.add('nav-group-heading');
      }
    });
    columns.append(ul);
  });
  panel.append(panelHeading, columns);

  return {
    tab, tabButton, intro, panel,
  };
}

/**
 * Builds the search bar: form, close, submit and suggestion prompts.
 * @param {Element} section fragment search section
 */
function buildSearch(section) {
  const link = section.querySelector('a[href]');
  const icon = section.querySelector('img');
  const action = link ? link.href : '/search-results.html';
  const paragraphs = [...section.querySelectorAll(':scope > p')];
  const placeholder = paragraphs.find((p) => !p.querySelector('img'))?.textContent.trim() || '';
  const prompts = [...section.querySelectorAll(':scope > ul > li')].map((li) => li.textContent.trim());

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-search-toggle';
  toggle.setAttribute('aria-controls', 'nav-search');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', icon?.alt || 'Search');
  if (icon) {
    icon.alt = '';
    toggle.append(icon);
  }

  const panel = document.createElement('div');
  panel.className = 'nav-search';
  panel.id = 'nav-search';
  panel.hidden = true;
  const form = document.createElement('form');
  form.action = action;
  form.method = 'get';
  form.setAttribute('role', 'search');
  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'query';
  input.placeholder = placeholder;
  input.autocomplete = 'off';
  input.setAttribute('aria-label', toggle.getAttribute('aria-label'));
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'nav-search-close';
  close.setAttribute('aria-label', 'Close search');
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'nav-search-submit';
  submit.setAttribute('aria-label', toggle.getAttribute('aria-label'));
  if (icon) submit.append(icon.cloneNode(true));
  form.append(input, close, submit);
  panel.append(form);

  if (prompts.length) {
    const list = document.createElement('ul');
    list.className = 'nav-search-prompts';
    prompts.forEach((text) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = text;
      btn.addEventListener('click', () => {
        input.value = text;
        form.requestSubmit();
      });
      li.append(btn);
      list.append(li);
    });
    panel.append(list);
  }

  return {
    toggle, panel, input, close,
  };
}

/**
 * Whether the page opens with a full-bleed hero the header can overlay.
 */
function startsWithHero() {
  const first = document.querySelector('main > .section');
  return !!first?.querySelector(':scope > [class*="hero"]');
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fetched = await fetchNav();
  if (!fetched) return;
  const root = document.createElement('div');
  root.innerHTML = fetched.html;
  resolveImages(root, fetched.base);
  const {
    brand, menus, utilities, search,
  } = classifySections(root);

  block.textContent = '';
  const header = block.closest('header');
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');

  // top bar
  const bar = document.createElement('div');
  bar.className = 'nav-bar';
  const hamburger = buildHamburger();
  const brandEl = document.createElement('div');
  brandEl.className = 'nav-brand';
  if (brand) brandEl.append(...brand.childNodes);
  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  bar.append(hamburger, brandEl, tools);

  // full-screen menu
  const menu = document.createElement('div');
  menu.className = 'nav-menu';
  menu.id = 'nav-menu';
  menu.hidden = true;
  const sidebar = document.createElement('div');
  sidebar.className = 'nav-sidebar';
  const tabList = document.createElement('ul');
  tabList.className = 'nav-tabs';
  const stage = document.createElement('div');
  stage.className = 'nav-stage';
  const built = menus.map((section, i) => buildMenuSection(section, i));
  built.forEach(({ tab, intro, panel }) => {
    tabList.append(tab);
    stage.append(intro, panel);
  });
  sidebar.append(tabList);
  if (utilities) {
    const utilList = utilities.querySelector('ul');
    utilList.className = 'nav-utilities';
    sidebar.append(utilList);
  }
  menu.append(sidebar, stage);

  nav.append(bar, menu);

  // search
  let searchParts = null;
  if (search) {
    searchParts = buildSearch(search);
    tools.append(searchParts.toggle);
    nav.append(searchParts.panel);
  }

  // section preview (hover) and selection (click)
  const setPreview = (index) => {
    built.forEach(({ tab, intro }, i) => {
      tab.classList.toggle('is-preview', i === index);
      intro.classList.toggle('is-visible', i === index);
    });
  };
  const select = (index) => {
    built.forEach(({ tab, tabButton, panel }, i) => {
      const active = i === index;
      tab.classList.toggle('is-active', active);
      tabButton.setAttribute('aria-expanded', active ? 'true' : 'false');
      panel.classList.toggle('is-visible', active);
    });
    menu.classList.toggle('has-panel', index >= 0);
    nav.classList.toggle('has-panel', index >= 0);
  };
  built.forEach(({ tab, tabButton }, i) => {
    tab.addEventListener('mouseenter', () => {
      if (!menu.classList.contains('has-panel')) setPreview(i);
    });
    tabButton.addEventListener('click', () => {
      const isOpen = tabButton.getAttribute('aria-expanded') === 'true';
      select(isOpen && !isDesktop.matches ? -1 : i);
      setPreview(i);
    });
  });

  const toggleSearch = (force) => {
    if (!searchParts) return;
    const open = force ?? searchParts.panel.hidden;
    searchParts.panel.hidden = !open;
    searchParts.toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.classList.toggle('search-open', open);
    if (open) searchParts.input.focus();
  };

  const toggleMenu = (force) => {
    const open = force ?? hamburger.getAttribute('aria-expanded') !== 'true';
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    menu.hidden = !open;
    nav.classList.toggle('menu-open', open);
    header?.classList.toggle('menu-open', open);
    document.body.style.overflowY = open ? 'hidden' : '';
    select(-1);
    if (open) {
      toggleSearch(false);
      setPreview(0);
    }
  };

  hamburger.addEventListener('click', () => toggleMenu());
  if (searchParts) {
    searchParts.toggle.addEventListener('click', () => {
      if (hamburger.getAttribute('aria-expanded') === 'true') toggleMenu(false);
      toggleSearch();
    });
    searchParts.close.addEventListener('click', () => toggleSearch(false));
    searchParts.panel.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        toggleSearch(false);
        searchParts.toggle.focus();
      }
    });
  }

  // reset menu state when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => {
    toggleMenu(false);
    toggleSearch(false);
  });

  // transparent over a leading hero, solid once scrolled (or when there is no hero)
  const overlay = startsWithHero();
  header?.classList.toggle('header-overlay', overlay);
  const onScroll = () => nav.classList.toggle('is-scrolled', !overlay || window.scrollY > 0);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
