# Marketo Forms EW Plugin

Static, build-free form picker for Experience Workspace's library extensions.
It fetches only the local `forms.json` mock response. Search matches form name,
ID, description, or folder. Selecting a form copies its published embed URL;
the copy button repeats that action. Clipboard failures select the URL for
manual copying. Nothing is inserted into or saved to the current document.

## URLs

- Local: `http://localhost:3000/tools/marketo-forms/index.html`
- Deployed: `https://main--bah--jfoxx.aem.live/tools/marketo-forms/index.html`

The host and account are set in `marketo-forms.js`. For example, form 2884 copies:

```text
https://pages.marketolive.com/?munchkinId=185-NGX-811&formId=2884
```

The `url` fields in the response are Marketo editor links, not embed URLs.
Those links are preserved in the fixture but are not copied. The picker does
not load forms, submit leads, use credentials, or call any Marketo endpoint.
The supplied records are demo clones, not production Booz Allen forms.

## EW Registration

After deploying the code, add this row to the site's **library** configuration
sheet, preserving existing rows:

| title | path | experience |
| --- | --- | --- |
| Marketo Forms | /tools/marketo-forms/index.html | dialog |

EW delegates clipboard-write permission to extension iframes. The picker also
works independently in a browser. Use an HTTPS deployed URL in EW, not localhost.
Site configuration is separate from this code; this change does not modify it.

The header uses the supplied Marketo logo asset. Interface icons are adapted
from Lucide (ISC license): https://lucide.dev/license.