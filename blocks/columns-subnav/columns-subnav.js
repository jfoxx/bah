/*
 * Columns Subnav block
 * Section sub-navigation bar: a list of top-level links (each optionally carrying a nested list
 * that becomes a dropdown) beside a group of call-to-action links.
 *
 * Authoring (one row, two cells):
 *   | Columns Subnav                                                 |
 *   | bulleted list (nested lists = dropdowns) | CTA links (Careers, Contact Us) |
 * If the CTA cell is omitted the bar renders the link list only.
 * Below 900px the bar collapses behind a menu button ("<Section> Menu" when the first item
 * is "<Section> Home", else "Menu"); dropdowns expand inline. From 900px dropdowns open on hover
 * as a full-width strip under the bar.
 */

const OPTION_CLASSES = [];

let subnavId = 0;

function closeAll(block, except) {
  block.querySelectorAll('.columns-subnav-toggle[aria-expanded="true"]').forEach((btn) => {
    if (btn === except) return;
    btn.setAttribute('aria-expanded', 'false');
    btn.closest('li').classList.remove('columns-subnav-open');
  });
}

/**
 * Authored list items arrive as `<li> <p><a>Label</a></p> <ul>…</ul> </li>`: unwrap the
 * paragraph (a block element inside the inline label) and drop whitespace-only text nodes.
 */
function normalizeItem(li) {
  [...li.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) node.remove();
  });
  li.querySelectorAll(':scope > p').forEach((p) => p.replaceWith(...p.childNodes));
}

function decorateList(block, ul) {
  ul.classList.add('columns-subnav-list');
  [...ul.children].forEach((li, idx) => {
    if (li.tagName !== 'LI') return;
    li.classList.add('columns-subnav-item');
    normalizeItem(li);
    const sub = li.querySelector(':scope > ul, :scope > ol');
    if (!sub) return;

    li.classList.add('columns-subnav-has-dropdown');
    sub.classList.add('columns-subnav-dropdown');
    subnavId += 1;
    sub.id = `columns-subnav-dropdown-${subnavId}-${idx}`;

    // wrap the label (link or plain text) so it sits beside the toggle
    const label = document.createElement('span');
    label.className = 'columns-subnav-label';
    [...li.childNodes].forEach((node) => {
      if (node !== sub) label.append(node);
    });
    const labelText = label.textContent.trim();

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'columns-subnav-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', sub.id);
    toggle.setAttribute('aria-label', `Show ${labelText} links`);
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      // a click on an item the pointer just opened by hover keeps it open (also covers taps)
      const open = toggle.getAttribute('aria-expanded') === 'true' && !li.dataset.hoverOpen;
      delete li.dataset.hoverOpen;
      closeAll(block, toggle);
      toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      li.classList.toggle('columns-subnav-open', !open);
    });

    // a label without its own link acts as a toggle too
    if (!label.querySelector('a')) {
      label.addEventListener('click', () => toggle.click());
    }

    li.prepend(label, toggle);
  });
}

/**
 * Mobile menu button text: the source labels it after the section ("AI Menu"), so derive it from
 * a first item named "<Section> Home"; otherwise fall back to a generic "Menu".
 */
function menuLabel(nav) {
  const first = nav.querySelector('.columns-subnav-item');
  const text = first ? first.textContent.trim() : '';
  const match = text.match(/^(.+?)\s+home$/i);
  return match ? `${match[1]} Menu` : 'Menu';
}

/** desktop dropdowns open on hover, like the source; click/keyboard toggles still work */
function enableHover(block, desktop) {
  block.querySelectorAll('.columns-subnav-has-dropdown').forEach((li) => {
    const toggle = li.querySelector(':scope > .columns-subnav-toggle');
    const set = (open) => {
      if (!desktop.matches) return;
      if (open) {
        closeAll(block, toggle);
        li.dataset.hoverOpen = 'true';
      } else {
        delete li.dataset.hoverOpen;
      }
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      li.classList.toggle('columns-subnav-open', open);
    };
    li.addEventListener('mouseenter', () => set(true));
    li.addEventListener('mouseleave', () => set(false));
  });
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');
  const desktop = window.matchMedia('(width >= 900px)');

  const cells = [...block.children].flatMap((row) => [...row.children]);
  const nav = document.createElement('nav');
  nav.className = 'columns-subnav-nav';
  nav.setAttribute('aria-label', 'Section navigation');
  const actions = document.createElement('div');
  actions.className = 'columns-subnav-actions';

  cells.forEach((cell) => {
    const list = cell.querySelector(':scope > ul, :scope > ol');
    if (list && !nav.querySelector('.columns-subnav-list')) {
      decorateList(block, list);
      nav.append(list);
      // anything else authored beside the list stays with the actions
      while (cell.firstChild) actions.append(cell.firstChild);
    } else {
      while (cell.firstChild) actions.append(cell.firstChild);
    }
  });
  actions.querySelectorAll('p').forEach((p) => { if (!p.textContent.trim() && !p.children.length) p.remove(); });

  // the panel collapses behind a menu button on mobile; on desktop it is always shown
  subnavId += 1;
  const panel = document.createElement('div');
  panel.className = 'columns-subnav-panel';
  panel.id = `columns-subnav-panel-${subnavId}`;
  panel.append(nav);
  if (actions.children.length) panel.append(actions);

  const menuToggle = document.createElement('button');
  menuToggle.type = 'button';
  menuToggle.className = 'columns-subnav-menu-toggle';
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-controls', panel.id);
  const menuText = document.createElement('span');
  menuText.className = 'columns-subnav-menu-label';
  menuText.textContent = menuLabel(nav);
  const menuIcon = document.createElement('span');
  menuIcon.className = 'columns-subnav-menu-icon';
  menuIcon.setAttribute('aria-hidden', 'true');
  menuToggle.append(menuText, menuIcon);
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    block.classList.toggle('columns-subnav-menu-open', !open);
    if (open) closeAll(block);
  });

  block.replaceChildren(menuToggle, panel);
  enableHover(block, desktop);

  desktop.addEventListener('change', () => {
    closeAll(block);
    menuToggle.setAttribute('aria-expanded', 'false');
    block.classList.remove('columns-subnav-menu-open');
  });

  document.addEventListener('click', (e) => {
    if (!block.contains(e.target)) closeAll(block);
  });
  block.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = block.querySelector('.columns-subnav-toggle[aria-expanded="true"]');
    if (open) {
      closeAll(block);
      open.focus();
    } else if (menuToggle.getAttribute('aria-expanded') === 'true') {
      menuToggle.click();
      menuToggle.focus();
    }
  });
}
