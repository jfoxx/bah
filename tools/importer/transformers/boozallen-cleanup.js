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
      // Empty placeholder background videos (404 sources), incl. inside every expertise
      // card_carousel card: <div class="background-video"><video><source src="/download">
      // Sorry, your browser doesn't support embedded videos.</video></div>
      // Removed before parsing so the fallback text never leaks into block cells.
      // Real (Scene7) videos, e.g. the homepage hero, are untouched.
      '.background-video:has(source[src="/download"])',
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
    // Source CTAs -> authored emphasis, which EDS decorateButtons turns into buttons:
    // teal <a class="button default-style"> and (defense pages) teal
    // <a class="button button--primary-on-light"> e.g. 'Learn More' (rgb(0,132,145))
    // -> italic (secondary button);
    // black/white <a class="button button--secondary-on-light|dark|white"> -> bold (primary button).
    // In-page sub-nav CTAs (<a class="in-page-horizontal-nav__cta ... button--primary-on-light">)
    // are excluded from teal: they belong to the columns-subnav block.
    element.querySelectorAll('a.button').forEach((a) => {
      if (a.closest('strong, em')) return;
      const teal = a.classList.contains('default-style')
        || (a.classList.contains('button--primary-on-light')
          && !a.classList.contains('in-page-horizontal-nav__cta'));
      const wrapper = element.ownerDocument.createElement(teal ? 'em' : 'strong');
      a.replaceWith(wrapper);
      wrapper.append(a);
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
      // <h1 class="visuallyhidden">Artificial Intelligence Solutions</h1> on expertise pages
      // is the same element (SEO duplicate of the hero H1) - covered by 'h1.visuallyhidden' above.
      // Decorative section background patterns (home-pattern-*.png) - conveyed by section style
      // (pattern-waves / pattern-rings). Runs after parsers: on expertise pages the
      // columns-backdrop parser matches '.grid-layout__wrapper > .grid-layout', which contains
      // its .grid-layout__background image, so that image is already in the block by now.
      '.grid-layout__background',
      // Defense/market pages: desktop-only duplicate of the in-page nav submenus, sibling of
      // the columns-subnav source (#in-page-horizontal-nav) inside .in_page_horizontal_navigation:
      // <div class="in-page-submenu__container hide-for-small-only">
      'div.in-page-submenu__container',
      // Empty script-injected body-level helpers on defense pages:
      // <div id="bah-subnav-sentinel_in-page-horizontal-nav">, <div id="mktoStyleLoaded">,
      // and the empty Marketo XD form <form class="mktoForm ..."> directly under <body>
      // (the real form lives inside .marketo_form, handled by the embed-marketo parser)
      '[id^="bah-subnav-sentinel"]',
      '#mktoStyleLoaded',
      'body > form.mktoForm',
      // Remaining non-authorable embeds/tracking
      'iframe',
      'noscript',
      'link',
    ]);
  }
}
