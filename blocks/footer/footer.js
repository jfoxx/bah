/**
 * Fetches the footer fragment: /content first (local preview), then root (DA/EDS).
 * @returns {Promise<{html: string, base: URL}|null>}
 */
async function fetchFooter() {
  // metadata-independent: /content first (localhost), then root (DA/EDS prod)
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: new URL(resp.url, window.location.href) };
}

/**
 * Creates an element with a class name.
 * @param {string} tag tag name
 * @param {string} className class name
 */
function el(tag, className) {
  const node = document.createElement(tag);
  node.className = className;
  return node;
}

/**
 * Builds the brand band: logo, social icons, newsletter call to action.
 * @param {Element} section fragment section
 * @param {URL} base fragment URL, for resolving image paths
 */
function buildTop(section, base) {
  const band = el('div', 'footer-top');
  const content = el('div', 'footer-top-content');
  const newsletter = el('div', 'footer-newsletter');

  const paragraphs = [...section.querySelectorAll(':scope > p')];
  const logo = paragraphs.find((p) => p.querySelector('img'));
  if (logo) {
    logo.className = 'footer-logo';
    content.append(logo);
  }

  const social = section.querySelector(':scope > ul');
  if (social) {
    social.className = 'footer-social';
    social.querySelectorAll('a').forEach((a) => {
      const img = a.querySelector('img');
      if (!img) return;
      // render the icon as a mask so it can take the link colour (hover state)
      const icon = el('span', 'footer-social-icon');
      icon.style.setProperty('--icon', `url("${new URL(img.getAttribute('src'), base).href}")`);
      a.setAttribute('aria-label', img.alt);
      img.replaceWith(icon);
    });
    content.append(social);
  }

  // newsletter labels: the first is the desktop label, any further one is the mobile label
  let labelCount = 0;
  paragraphs.filter((p) => p !== logo).forEach((p) => {
    const link = p.querySelector('a');
    if (link && p.textContent.trim() === link.textContent.trim()) {
      link.className = 'footer-cta';
      p.className = 'footer-cta-wrapper';
    } else {
      p.className = `footer-newsletter-text ${labelCount ? 'footer-newsletter-text-mobile' : 'footer-newsletter-text-desktop'}`;
      labelCount += 1;
    }
    newsletter.append(p);
  });
  if (labelCount === 1) newsletter.querySelector('.footer-newsletter-text').className = 'footer-newsletter-text';

  content.append(newsletter);
  band.append(content);
  return band;
}

/**
 * Builds the sitemap: one column per heading + link list.
 * @param {Element} section fragment section
 */
function buildSitemap(section) {
  const nav = el('nav', 'footer-sitemap');
  nav.setAttribute('aria-label', 'Footer Navigation');
  const content = el('div', 'footer-sitemap-content');
  section.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > h4').forEach((heading, i) => {
    const col = el('div', 'footer-col');
    const list = heading.nextElementSibling;
    heading.classList.add('footer-col-title');
    col.append(heading);
    if (list?.tagName === 'UL') {
      list.className = 'footer-col-links';
      list.id = `footer-col-links-${i}`;
      // mobile accordion toggle (columns are always open on desktop)
      const toggle = el('button', 'footer-col-toggle');
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', list.id);
      toggle.append(...heading.childNodes);
      heading.append(toggle);
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        col.classList.toggle('is-open', open);
      });
      col.append(list);
    }
    content.append(col);
  });
  nav.append(content);
  return nav;
}

/**
 * Builds the legal bar: copyright + legal links.
 * @param {Element} section fragment section
 */
function buildBottom(section) {
  const band = el('div', 'footer-bottom');
  const content = el('div', 'footer-bottom-content');
  const copyright = section.querySelector(':scope > p');
  if (copyright) {
    copyright.className = 'footer-copyright';
    content.append(copyright);
  }
  const legal = section.querySelector(':scope > ul');
  if (legal) {
    legal.className = 'footer-legal';
    content.append(legal);
  }
  band.append(content);
  return band;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fetched = await fetchFooter();
  if (!fetched) return;
  const root = document.createElement('div');
  root.innerHTML = fetched.html;
  root.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!/^(https?:|data:|\/)/.test(src)) img.src = new URL(src, fetched.base).href;
  });
  const sections = [...root.children].filter((s) => s.tagName === 'DIV');
  const sitemapSection = sections.find((s) => s.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4'));
  const topSection = sections.find((s) => s !== sitemapSection && s.querySelector(':scope > p img'));
  const bottomSection = sections.find((s) => s !== sitemapSection && s !== topSection);

  block.textContent = '';
  const footer = el('div', 'footer-global');
  if (topSection) footer.append(buildTop(topSection, fetched.base));
  if (sitemapSection) footer.append(buildSitemap(sitemapSection));
  if (bottomSection) footer.append(buildBottom(bottomSection));
  block.append(footer);
}
