# Thooku blocked-access handling

Some sites return `403`, a "Just a moment" page, a CAPTCHA, or a login wall to automated clients while a person in a normal browser sees the page. This is the site owner's choice. Thooku does not defeat it. Thooku detects it, reports it, and moves to a route the owner allows or the user supplies.

## Never do this

- Spoof a browser User-Agent, TLS fingerprint, or headers to pass as a person.
- Use stealth plugins, proxy or IP rotation, or CAPTCHA and challenge solvers.
- Replay cookies or clearance tokens taken from another session.
- Retry a `403` in a loop. A `403` is a decision, not a glitch.
- Fill in content the blocked page did not show. Mark it `Unknown`.

## Detect

Run `scripts/access-probe.js` right after the first navigation. Read `verdict`:

| `verdict` | Meaning | Next step |
| --- | --- | --- |
| `ok` | Real page loaded | Continue with Phase 1 |
| `blocked` | HTTP 4xx or "access denied" text | Ladder below |
| `challenge` | Bot challenge or CAPTCHA widget | Ladder below. Do not click or wait it out. |
| `login` | Login wall, short page with a password field | Ask the user. Do not sign in on their behalf unless they asked. |
| `unclear` | Near-empty body | Wait for meaningful content once (Phase 2 step 1). If still empty, treat as `blocked`. |

Static mode (no browser): a `403`, `401`, or a body matching the `challenge-text` patterns above is the same as `blocked`. Retry only `429` and `503`, at most three times, with exponential backoff and the `Retry-After` value. Send a descriptive User-Agent, for example `thooku/1.2 (design-reconnaissance; +https://github.com/niranjraj/thooku)`, and fetch `robots.txt` first.

Common block markers (headers, for the report):

- `cf-mitigated: challenge` or `server: cloudflare` with a 403;
- `x-vercel-mitigated: challenge`;
- a `403` from a CDN with no site-specific body.

## Ladder

Work down the list. Stop at the first rung that gives usable evidence. Tell the user which rung you used.

1. **Owner-published sources.** Public API, `sitemap.xml`, RSS or Atom feed, `llms.txt`, a public style guide, design-system site, or brand page. These carry the owner's permission by being published.
2. **User's own browser.** If Claude in Chrome is connected, the user's real browser is a person-driven session and usually passes. Use it only for the pages the user named. Keep the Claude in Chrome session rules in `tooling.md`. If a challenge still appears there, stop and ask the user to complete it in their browser. Do not automate it.
3. **User-supplied material.** Ask the user for one of:
   - the page saved from their browser (File > Save Page As, "Webpage, Complete") into the project;
   - the rendered DOM: DevTools > Elements > right-click `<html>` > Copy > Copy outerHTML;
   - the computed styles or CSS variables pasted from DevTools;
   - screenshots at desktop and mobile widths.
   Parse these as static input. Static input proves structure, styles, and assets. It does not prove motion or runtime behavior.
4. **Archived copy.** A Wayback Machine snapshot (`https://archive.org/wayback/available?url=<url>`) may exist. Mark the date. It can differ from the live site.
5. **Ask the owner.** If the user owns the site, they can allow-list the inspection client in their firewall or bot-protection settings (Cloudflare WAF rule, Vercel Firewall bypass rule), or run thooku against a staging URL without bot protection.
6. **Stop.** If none of the above works, say what was blocked and what is `Unknown`. Do not guess.

## Report it

Put this in Inspection coverage, once per blocked origin:

```text
Origin: https://example.com
Result: blocked (HTTP 403, Cloudflare challenge)
Route used: user-supplied DOM export (rung 3)
Not verified: motion, hover and focus states, live responsive behavior
Date: YYYY-MM-DD
```

Label every finding from a substitute route with that route, for example `Observed (user-supplied HTML)`. Label values the route cannot show `Unknown`.
