# Alert

A notice block with `normal` and `urgent` class-based variants. Plain `Alert`
uses the normal appearance. If both variants are present, urgent takes precedence.

## Content model

| Alert (normal) |
| --- |
| **Scheduled maintenance** |

Put the full message in that cell, using paragraphs, optional headings, lists,
and links. Additional rows and cells are supported and read in document order.
No configuration rows are needed.

Use `Alert (urgent)` for time-sensitive notices. Normal alerts have a teal accent
and a visible "Notice" label; urgent alerts have a red accent and an "Urgent"
label. Severity is conveyed by text as well as color. The block is a labeled
region, not an assertive live region: page-load notices do not interrupt screen
reader users. This is a static notice, with no dismiss button or persistence.

Authored elements are preserved for layout editing. Decoration can run repeatedly
without duplicating the severity label.

## Library and preview

- Library examples: `/docs/library/blocks/alert`
- Local checks: `/drafts/alert-edge`

The library page includes each variant once. The drafts page additionally covers
the default, multiple rows and cells, long content, empty cells, and an empty block.
The library metadata is for the authoring library; this project has no site
renderer for it, so use the drafts page for a clean site preview.

To make the examples available to authors, upload the local library page to the
existing library folder and add this row to the library index's **blocks** sheet:

| name | path |
| --- | --- |
| Alert | https://content.da.live/jfoxx/bah/docs/library/blocks/alert |

Local content does not install the entry in Experience Workspace. After installing,
check both variants in layout view by editing the message and moving the block.