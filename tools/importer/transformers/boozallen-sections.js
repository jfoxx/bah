/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Booz Allen (boozallen.com) section breaks + Section Metadata.
 * Shared by all templates (home, expertise, ...). Uses payload.template.sections
 * from tools/importer/page-templates.json (selector arrays are DOM-verified
 * boundaries from page analysis).
 *
 * beforeTransform: section elements are resolved while they all still exist and
 * a COMMENT node marker is placed before each one. A comment (not an <hr>) is used
 * because the expertise template's section and block selectors rely on
 * `:nth-child(n)`, which counts every element sibling - inserting <hr> elements
 * before block parsing would shift those indices and make parsers match the wrong
 * section. Comment nodes are invisible to :nth-child / :nth-of-type.
 *
 * afterTransform (after block parsers ran): each marker becomes the section break
 * <hr> (none for the first section) followed by the Section Metadata block when the
 * section has a style.
 */
const MARKER_PREFIX = 'excat-section:';
const SHOW_COMMENT = 128; // NodeFilter.SHOW_COMMENT

// section.selector is an array of candidate selectors - first match wins.
function querySection(root, selectors) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (const sel of list) {
    if (!sel) continue;
    let el = null;
    try {
      el = root.querySelector(sel);
    } catch (e) {
      el = null;
    }
    if (el) return el;
  }
  return null;
}

function findMarkers(root) {
  const doc = root.ownerDocument || document;
  const walker = doc.createTreeWalker(root, SHOW_COMMENT);
  const markers = {};
  let node = walker.nextNode();
  while (node) {
    const text = (node.nodeValue || '').trim();
    if (text.startsWith(MARKER_PREFIX)) markers[text.slice(MARKER_PREFIX.length)] = node;
    node = walker.nextNode();
  }
  return markers;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;
  const doc = element.ownerDocument || document;

  if (hookName === 'beforeTransform') {
    // Reverse order: inserting a marker never moves sections not yet processed.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no break, no metadata
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue; // selector not on this page - skip, never guess
      sectionEl.before(doc.createComment(`${MARKER_PREFIX}${section.id}`));
    }
  }

  if (hookName === 'afterTransform') {
    const markers = findMarkers(element);

    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue;

      const marker = markers[section.id];
      let anchor = null;
      if (marker && marker.parentNode) {
        anchor = marker;
      } else {
        // Marker lost (its parent was replaced by a parser): fall back to the
        // section element itself if it survived parsing.
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        anchor = doc.createComment(`${MARKER_PREFIX}${section.id}`);
        sectionEl.before(anchor);
      }

      let insertAfter = anchor;
      if (i > 0) {
        const hr = doc.createElement('hr');
        anchor.after(hr);
        insertAfter = hr;
      }
      if (section.style) {
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        insertAfter.after(metadataBlock);
      }
      anchor.remove();
    }

    // Drop any leftover markers
    Object.values(findMarkers(element)).forEach((c) => c.remove());
  }
}
