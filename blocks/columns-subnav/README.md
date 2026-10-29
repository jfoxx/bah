# columns-subnav

Custom **columns** block. Purpose: section-subnav.

## Authoring (Document Authoring)

Model: `standalone`

Single block table, one row:

| Columns Subnav |
| --- |
| bulleted list of links (a nested list under an item becomes its dropdown) | bold links (render as teal buttons, e.g. Careers, Contact Us) |

## Behavior

- Desktop (900px+): black 80px bar, sticky below the header. Dropdowns open on hover (click/keyboard also toggle) as a full-width dark gray strip under the bar.
- Mobile: collapsed behind a menu button labelled "<Section> Menu" when the first item is "<Section> Home" (else "Menu"); dropdowns expand inline with +/- toggles.

## Supported variations

| Variation | Option class | Source |
| --- | --- | --- |
| Default | - | `.horizontal-navigation` (big-hero pages, e.g. /expertise/artificial-intelligence) |
| In-page | `in-page` | `.in-page-horizontal-nav` (overview-hero pages, e.g. /markets/defense/ai-for-military) |

In-page: no rule under the bar, white regular-weight links (20px side padding) that turn teal and bold on hover with no background change, a "More Content" mobile button, buttons spaced 25px apart and inset 44px from the right edge, and dropdown items with a white 4px underline on hover. Authors can set it explicitly with `Columns Subnav (in-page)`. If it isn't set, it is inferred when the section directly before the subnav holds a `Hero Banner (light)` (the overview hero), which is how the source pairs them.

## Universal Editor fields

N/A (Document Authoring project)
