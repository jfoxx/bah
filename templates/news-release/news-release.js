import { getMetadata, createOptimizedPicture } from '../../scripts/aem.js';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Formats a `DD-MM-YYYY` release-date value as `Month D, YYYY`.
 * Returns the trimmed raw value if it is not in that shape.
 */
function formatReleaseDate(value) {
  const match = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(value.trim());
  if (!match) return value.trim();
  const [, day, month, year] = match;
  const name = MONTHS[Number(month) - 1];
  if (!name) return value.trim();
  return `${name} ${Number(day)}, ${year}`;
}

/**
 * News release template.
 * Backend markup is author-driven; decorate defensively.
 * @param {Element} main The main element
 */
export default async function decorate(main) {
  const content = main.querySelector('.default-content-wrapper') || main.querySelector(':scope > div');
  if (!content) return;

  const heading = content.querySelector('h1');

  // meta line: formatted release date + dateline, placed under the title
  const releaseDate = getMetadata('release-date');
  const dateline = getMetadata('dateline');
  if (heading && (releaseDate || dateline)) {
    const meta = document.createElement('p');
    meta.className = 'news-release-meta';
    if (releaseDate) {
      const date = document.createElement('span');
      date.className = 'news-release-date';
      date.textContent = formatReleaseDate(releaseDate);
      meta.append(date);
    }
    if (dateline) {
      const place = document.createElement('span');
      place.className = 'news-release-dateline';
      place.textContent = dateline;
      meta.append(place);
    }
    heading.after(meta);
  }

  // hero image from og:image metadata, placed between the title and meta line
  const ogImage = getMetadata('og:image');
  if (heading && ogImage) {
    let src = ogImage;
    try {
      src = new URL(ogImage, window.location.href).pathname;
    } catch { /* use raw value */ }
    const picture = createOptimizedPicture(src, heading.textContent, false, [{ width: '1200' }]);
    const wrapper = document.createElement('p');
    wrapper.className = 'news-release-image';
    wrapper.append(picture);
    heading.after(wrapper);
  }

  // lead paragraph: first body paragraph after the title/meta
  const paragraphs = [...content.querySelectorAll(':scope > p')];
  const lead = paragraphs.find((p) => !p.classList.contains('news-release-meta')
    && !p.classList.contains('news-release-image'));
  if (lead) lead.classList.add('news-release-lead');

  // boilerplate: trailing "About" / "Forward-Looking Statements" groups
  const boilerplateStart = paragraphs.find((p) => {
    const strong = p.querySelector(':scope > strong');
    return strong && p.textContent.trim() === strong.textContent.trim();
  });
  if (boilerplateStart) {
    let node = boilerplateStart;
    while (node) {
      node.classList.add('news-release-boilerplate');
      node = node.nextElementSibling;
    }
  }
}
