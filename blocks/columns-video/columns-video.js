/*
 * Columns Video block
 * Two-column intro: text (heading, paragraph, optional logo image) beside a video embed with an
 * optional collapsible transcript.
 *
 * Authoring (one row, two cells; cell order is respected):
 *   | Columns Video                                                              |
 *   | H2, paragraph, logo image | video link, transcript label, transcript paragraph(s) |
 * The video cell is the one holding an embeddable link (Vbrick, YouTube, Vimeo). Paragraphs after
 * the link become a <details> transcript: the first paragraph is the summary, the rest the body.
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

const EMBED_PATTERN = /vbrick\.com|youtube\.com|youtu\.be|vimeo\.com|\/embed[/?]/i;

function toEmbedUrl(href) {
  try {
    const url = new URL(href);
    if (url.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
    }
    if (url.hostname.includes('youtube.com') && url.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${url.searchParams.get('v')}`;
    }
    if (url.hostname === 'vimeo.com') {
      return `https://player.vimeo.com/video${url.pathname}`;
    }
    return url.href;
  } catch {
    return href;
  }
}

function findEmbedLink(cell) {
  return [...cell.querySelectorAll('a')].find((a) => EMBED_PATTERN.test(a.href));
}

function buildEmbed(link) {
  const wrapper = document.createElement('div');
  wrapper.className = 'columns-video-embed';
  const src = toEmbedUrl(link.href);
  const title = link.title || (link.textContent.trim() !== link.href ? link.textContent.trim() : '') || 'Video';

  const load = () => {
    if (wrapper.querySelector('iframe')) return;
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = title;
    iframe.loading = 'lazy';
    // `fullscreen` in the permissions policy replaces the legacy allowfullscreen attribute
    iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    wrapper.append(iframe);
  };

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      load();
    }
  });
  observer.observe(wrapper);
  return wrapper;
}

function buildTranscript(blocks) {
  const [summaryEl, ...body] = blocks;
  const details = document.createElement('details');
  details.className = 'columns-video-transcript';
  const summary = document.createElement('summary');
  const title = document.createElement('span');
  title.className = 'columns-video-transcript-title';
  title.innerHTML = summaryEl.innerHTML;
  // visual "Expand +" / "Collapse -" affordance; <details> already exposes the expanded state
  const toggle = document.createElement('span');
  toggle.className = 'columns-video-transcript-toggle';
  toggle.setAttribute('aria-hidden', 'true');
  toggle.innerHTML = '<span class="columns-video-transcript-expand">Expand</span>'
    + '<span class="columns-video-transcript-collapse">Collapse</span>'
    + '<span class="columns-video-transcript-icon"></span>';
  summary.append(title, toggle);
  details.append(summary);
  const content = document.createElement('div');
  content.className = 'columns-video-transcript-body';
  content.append(...body);
  details.append(content);
  summaryEl.remove();
  return details;
}

function decorateVideoCell(cell, link) {
  cell.classList.add('columns-video-media');
  const holder = link.closest('p') || link;
  const embed = buildEmbed(link);
  holder.replaceWith(embed);

  // remaining content after the embed: label + transcript paragraphs
  const after = [];
  let node = embed.nextElementSibling;
  while (node) {
    after.push(node);
    node = node.nextElementSibling;
  }
  if (after.length >= 2) embed.after(buildTranscript(after));
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  [...block.children].forEach((row) => {
    row.classList.add('columns-video-row');
    [...row.children].forEach((cell) => {
      const link = findEmbedLink(cell);
      if (link) {
        decorateVideoCell(cell, link);
      } else {
        cell.classList.add('columns-video-text');
        cell.querySelectorAll('picture > img').forEach((img) => {
          img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]));
        });
      }
    });
  });
}
