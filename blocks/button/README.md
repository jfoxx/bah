# Button

A configurable call to action for Experience Workspace's Block Inspector.
Use a regular formatted link instead when these additional settings are not needed.

## Content model

The first row contains a hyperlink with the visible label and destination in a
single merged cell. Other rows contain non-displayed settings. Settings can be
reordered or omitted; the link row is found by its hyperlink, not its position.

| Button | |
| --- | --- |
| [Explore Careers](https://www.boozallen.com/careers.html) | (merged cell) |
| Open | _self |
| Externalize | false |
| Alignment | left |
| Appearance | button |
| Style | primary |

Defaults are `_self`, `left`, `button`, and `primary`. Invalid settings use those
defaults. `Externalize` is stored for the demo but deliberately does nothing:
the destination URL is never changed. New-tab links get `rel="noopener"` while
preserving other relationship tokens. Links remain links, not ARIA buttons.
Style applies only to Button appearance; Text Link uses the site's link styles.

## Block Inspector

The local library template is `content/docs/library/blocks/button.html`. Its
Library Metadata includes the Fields table, with the key cells labeled IGNORE.
The single hyperlink field exposes both its text and destination.

Add the following rows to the existing library index's **options** sheet:

| blocks | key | values | type | checked | unchecked |
| --- | --- | --- | --- | --- | --- |
| button | Open | | checkbox | _blank | _self |
| button | Externalize | | checkbox | true | false |
| button | Alignment | Left=left\|Center=center\|Right=right | | | |
| button | Appearance | Button=button\|Text Link=link | | | |
| button | Style | Primary=primary\|Secondary=secondary | | | |

The checkboxes require the customized Block Inspector from `ew-extensions`.
The Open field is labeled **Open in a new tab** in Library Metadata. Checked
stores `_blank`; unchecked stores `_self`, preserving existing content values.
Configure the site's Inspector extension to load that deployed version. The
standard Inspector can instead use `No=false|Yes=true` in the `values` column
for Externalize and `Current window=_self|New tab=_blank` for Open, leaving
the other columns blank. Externalize remains a demo setting with no URL
transformation in either configuration.

Upload the library template to the site's existing Blocks library folder, then
add its row to the **blocks** sheet, following the existing rows:

| name | path |
| --- | --- |
| Button | https://content.da.live/jfoxx/bah/docs/library/blocks/button |

Use the actual library folder if it differs. This content and the index live
outside the code repository; local files alone do not install the library entry.
Keep the nested Fields table in Library Metadata, not inside the Button block.
There are no class-based variants or repeating-item configuration.

## Local checks

- Library: `/docs/library/blocks/button`
- Edge cases: `/drafts/button-edge`

The edge page covers defaults, reordered settings, Secondary, new-tab behavior,
Externalize on, right-aligned Text Link, long labels, invalid and missing settings,
a missing link, and a dark section. No additional test framework is required for
this static DOM decoration. In layout view, confirm that editing the link and
settings and moving the block still work after installing the library entry.

This project has no `library-metadata` renderer, so viewing the library document
as a regular site page produces metadata asset 404s. The metadata is consumed by
the authoring library, not the Button block. Use the drafts page for a clean site
preview; live Inspector and layout-view validation remains an authoring check.
