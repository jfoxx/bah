/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Booz Allen (boozallen.com) site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    WebImporter.DOMUtils.remove(element, [
      // <aside class="dg-consent-banner visible dg-right"> (DataGrail cookie consent)
      'aside.dg-consent-banner',
      // <iframe title="Adobe ID Syncing iFrame" id="destination_publishing_iframe_bah_0"> (tracking)
      'iframe#destination_publishing_iframe_bah_0',
      // <a href="#content" class="visually-hidden focusable skip-link">
      'a.skip-link',
    ]);
    // Third-party tracking pixels (cdn.bizible.com, ib.adnxs.com, pixel.mathtag.com,
    // insight.adsrvr.org, ...) vary per page load; all authored images live on boozallen.com
    element.querySelectorAll('img[src^="http"]').forEach((img) => {
      try {
        const { hostname } = new URL(img.getAttribute('src'));
        if (!/(^|\.)boozallen\.com$|(^|\.)scene7\.com$/.test(hostname)) img.remove();
      } catch (e) {
        // ignore unparsable src
      }
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Source CTAs (<a class="button button--secondary-on-light|dark">) -> bold links,
    // which EDS decorateButtons turns into primary buttons
    element.querySelectorAll('a.button').forEach((a) => {
      if (a.closest('strong')) return;
      const strong = element.ownerDocument.createElement('strong');
      a.replaceWith(strong);
      strong.append(a);
    });

    WebImporter.DOMUtils.remove(element, [
      // <div class="site-header__container ..."> wraps <nav class="site-header bah-navigation ...">
      'div.site-header__container',
      // <noindex><footer class="footer-global" id="footer-global">
      '#footer-global',
      'noindex',
      // <div class="link-to-top"><a href="#"><span>Top</span>...</a></div>
      'div.link-to-top',
      // <h1 class="visuallyhidden">Booz Allen Hamilton</h1> - screen-reader-only site title, not page content
      'h1.visuallyhidden',
      // Empty placeholder background videos: <video><source src="/download">Sorry, your browser...</video>
      '.background-video:has(source[src="/download"])',
      // Decorative section background patterns (home-pattern-*.png) - conveyed by section style
      // (pattern-waves / pattern-rings); runs after parsers, so block media is unaffected
      '.grid-layout__background',
      // Remaining non-authorable embeds/tracking
      'iframe',
      'noscript',
      'link',
    ]);
  }
}
