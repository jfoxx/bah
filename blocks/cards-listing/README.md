# cards-listing

Custom **cards** block. Purpose: dynamic-index-listing.

## Authoring (Document Authoring)

Model: `config`

Single block table. Content: one row, one cell of content.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)

## Content model (dynamic block)

This block has **no authored items**. It holds config only. `decorate()` fetches the query index
and renders the year filter, the list and the pager in the browser.

| Cards Listing |  |
| --- | --- |
| `/news-releases/query-index.json` (link, required; defaults to this path if missing) | |
| Tag | Press Release (optional, default "Press Release") |
| Page Size | 10 (optional, default 10) |

Example markup:

```html
<div class="cards-listing">
  <div><div><a href="/news-releases/query-index.json">/news-releases/query-index.json</a></div></div>
  <div><div>Tag</div><div>Press Release</div></div>
  <div><div>Page Size</div><div>10</div></div>
</div>
```

Absolute `*.aem.live` / `*.aem.page` links for the index or images are converted to the pathname,
so requests stay on the current host.

### Data source

The query index must expose `path`, `title`, `description`, `image` and `releaseDate` (`DD-MM-YYYY`).
All rows are loaded by paging with `?offset=&limit=` until `total` is reached. Rows are sorted by
`releaseDate`, newest first. Rows with no valid date go last. Dates are shown as en-US long dates
(e.g. "October 8, 2026").

### Behavior

- Year filter: "All" plus each distinct year (descending), and a **Filter** button. Applying it resets to page 1.
- Pager: numbered pages (window of 3), ellipsis, first/previous (when not on page 1), next (›) and last (»), plus "Displaying {start} - {end} of {total}".
- State: `?page=N&year=YYYY` is written with `history.replaceState` and restored on load. Values that are out of range are clamped or ignored.
- Accessibility: labelled `<select>`; `ul/li` list; `<nav aria-label="Pagination">` with `aria-current="page"`; polite live region on the summary; focus moves to the list after paging or filtering.
- A failed fetch shows a short message in a `role="status"` paragraph.

## Visual characteristics

- colorScheme: light
- density: balanced
- purpose: dynamic-index-listing
- imagePattern: landscape-thumb
- structure: query-index link + optional tag + optional page size (renders: year filter + image + title link + date + excerpt + tag rows + pager)

## Content pattern

dynamic query-index listing: config row (index link) + optional Tag / Page Size rows; renders year filter, image-left card rows, pager
