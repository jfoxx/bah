/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Booz Allen Newsroom (newsroom.boozallen.com, Drupal / Notified IR) cleanup.
 * Used by the press-releases template only. www.boozallen.com templates (home,
 * expertise, defense) keep using boozallen-cleanup.js - this file is newsroom-only.
 *
 * Authorable content kept:
 *   #content > div.overview-hero-wrapper   (hero-banner, section rc1)
 *   #block-client-site-202-content / .block-nir-news__widget (cards-listing, section rc2)
 *
 * All selectors verified in migration-work/cleaned.html (newsroom press-releases page)
 * and tools/importer/bd-snapshots/newsroom.boozallen.com/press-releases.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays and global chrome removed before parsing so nothing in them can be
    // picked up by block parsers.
    WebImporter.DOMUtils.remove(element, [
      // <aside class="dg-consent-banner visible dg-right"> (DataGrail cookie consent;
      // the only DataGrail element - the consent script is HTML comments only)
      'aside.dg-consent-banner',
      // <div id="skip"><a class="visually-hidden focusable skip-link" href="#lfg-main-content">
      '#skip',
      'a.skip-link',
      // Global header: <div id="block-client-site-202-pe-topnav" ...> wraps
      // <div class="site-header__container ..."><nav class="site-header bah-navigation ...">
      '#block-client-site-202-pe-topnav',
      // Global footer: <div id="block-client-site-202-pe-botnav"> > ... > <noindex>
      // <footer class="footer-global" id="footer-global">
      '#block-client-site-202-pe-botnav',
      '#footer-global',
      // Drupal body-level helpers: <div id="drupal-live-announce" class="visually-hidden">,
      // <div id="drupal-modal" class="ui-front">
      '#drupal-live-announce',
      '#drupal-modal',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    WebImporter.DOMUtils.remove(element, [
      // Back-to-top link: <div class="link-to-top for-link-to-top"><a href="#"><span>Top</span>
      'div.link-to-top',
      // Empty Drupal region chrome around the listing:
      // <div class="region region-content" id="lfg-main-content"><div class="hidden">
      '#lfg-main-content > div.hidden',
      // <div id="block-client-site-202-websitenoticeblock" class="block--website-notice-block ...">
      '#block-client-site-202-websitenoticeblock',
      // Remaining non-authorable embeds / stylesheets
      // (<link href="https://www.boozallen.com/etc.clientlibs/...css"> at end of body)
      'noindex',
      'iframe',
      'noscript',
      'link',
    ]);
  }
}
