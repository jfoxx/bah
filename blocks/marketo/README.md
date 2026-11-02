# Marketo

Adapted from [Arbory Digital's Marketo block](https://github.com/arbory-digital-inc/sas-demo/tree/main/blocks/marketo), licensed under Apache-2.0.

Uses a Marketo form link to load a hosted form with the Forms 2 API. Existing
`Embed Marketo` blocks are unchanged. Submission, validation, and thank-you
behavior remain configured in Marketo.

## Authoring

Create a **Marketo** block with a link in its first row:

| Marketo | |
| --- | --- |
| https://pages.marketolive.com/?munchkinId=185-NGX-811&formId=2611 | |

Make the URL a hyperlink. Replace the host and IDs with the approved form
settings. The block uses the link's HTTPS origin for both the Forms 2 script
and form, so no additional row is needed.

Existing `Base URL` rows still override the host. For a Marketo editor link
such as `https://engage-ab.marketo.com/?munchkinId=516-JQG-021#/ds/mktform/1205`,
add `Base URL | https://pages.boozallen.com` to use the published form host
instead of the editor host.

The block uses the project's form and button colors, preserves Marketo's
validation and conditional-field behavior, and displays a status message for
invalid configuration or a failed script load. No Munchkin analytics script
is added. Like the source block and existing `Embed Marketo`, Forms 2 loads
when the block is decorated; it is not gated by the demo consent flag. Review
the form's own cookie and privacy behavior before production use.