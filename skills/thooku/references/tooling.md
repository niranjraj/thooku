# Thooku tooling: free-first setup

Thooku itself is an instruction skill. It does not require a paid API. Its ability to inspect live websites depends on the runtime and tools available to the agent.

## Recommended free stack

### Option A0 — Playwright MCP (use it if already connected)
Thooku does not bundle a browser server, because many setups already have a Playwright MCP from another plugin and a second copy would duplicate it. Thooku uses whichever one is connected. To add one:

```bash
claude mcp add playwright -- npx @playwright/mcp@latest
```

The probes in `scripts/` are `async page => ...` functions, which is the shape `browser_run_code` takes. Pass the file's contents as the code argument.

| CLI | MCP tool |
| --- | --- |
| `open <url>` | `browser_navigate` |
| `resize <w> <h>` | `browser_resize` |
| `screenshot` | `browser_take_screenshot` |
| `eval "<fn>"` | `browser_evaluate` |
| `snapshot` | `browser_snapshot` |
| `run-code --filename=<file>` | `browser_run_code` |

The one-call timing rule still applies: keep trigger and measurement in one `browser_run_code` call. If `browser_run_code` is not exposed, enable the optional capability in the server config, or use the CLI.

### Option A1 — Claude in Chrome (browser extension)
Claude in Chrome acts in the user's own Chrome, in new tabs, with their existing sign-ins. Its tools are named `mcp__claude-in-chrome__*` and work only while Chrome is running with the extension connected. If only `enable__mcp__claude-in-chrome` is present, call it first. If the tools are deferred, load them in one ToolSearch call.

Session rules:
- Call `tabs_context_mcp` first, open a new tab with `tabs_create_mcp`, and close the tabs you opened when you finish.
- The user may have to allow each site. If a call is waiting on that permission, say so and wait. Do not work around it.
- The browser is signed in as the user. Inspect only the pages the user named. Do not click through authenticated areas, and never submit forms.
- Do not trigger `alert`, `confirm`, or other modal dialogs. They block the extension until the user dismisses them. Avoid buttons that raise a confirmation.
- If calls fail or time out after two or three tries, stop and tell the user. Do not keep retrying.

| CLI | Claude in Chrome tool |
| --- | --- |
| `open <url>` | `navigate` |
| `screenshot` | `computer` (screenshot action) |
| `hover`, `click`, scroll | `computer` |
| `snapshot` | `read_page` |
| `eval "<fn>"` | `javascript_tool` |
| console output | `read_console_messages` (pass `pattern` to filter) |
| network list | `read_network_requests` (fonts, images, scripts for the asset inventory) |

Claude in Chrome has no Playwright `page` object, so the probes run differently:

- **`stack-probe.js` and `animations-probe.js`:** send the function that is passed to `page.evaluate` to `javascript_tool`, called as an immediately invoked function. Delete the comment lines, delete the leading `async page => page.evaluate(` and the final `)`, then wrap what remains: `(() => { ... })()`.
- **`chrome-motion-probe.js`:** the one-call timing rule cannot hold, because hovering is a separate `computer` call. This probe records on the page's own clock instead. Copy it to a scratch directory, edit `selector`, `props` and `windowMs`, and send it to `javascript_tool`. Then trigger the interaction with `computer` before `windowMs` ends. Then send `window.__thookuRead()`. Timing comes from page timestamps, so tool delay does not enter the result. Label the result `Measured ±1 frame`.
- **Responsive widths:** resize the browser window if a resize tool is available. If not, record that the viewport was not controlled, and mark the breakpoint behavior `Unknown`.

### Option A — Claude Code + Playwright CLI (recommended for dynamic pages)
Playwright is an open-source browser automation framework. The CLI is useful for agent-driven inspection and has a skill install flow.

```bash
# Requires Node.js 20+
npm install -g @playwright/cli@latest
playwright-cli --help
# optional: install Playwright's own agent skill alongside Thooku
playwright-cli install --skills
```

If you prefer project-local dependencies:
```bash
npm install -D @playwright/cli@latest
npx playwright-cli --help
```

**Browser requirement.** `@playwright/cli` opens the Chrome channel by default. Without Chrome installed, `open` fails with:

```text
Chromium distribution 'chrome' is not found at /opt/google/chrome/chrome
```

Fix it one of two ways:
- Install Chrome.
- Or install Playwright's Chromium (about 120 MB, no sudo) and select it on `open`:

```bash
playwright-cli install-browser chromium
playwright-cli open --browser=chromium https://example.com
```

On Linux, Chromium may also need system libraries: `playwright-cli install-browser --with-deps` (this can need sudo).

Ask the user before installing anything.

Typical inspection commands:
```bash
playwright-cli open https://example.com   # add --browser=chromium if Chrome is not installed
playwright-cli resize 390 844
playwright-cli screenshot
playwright-cli eval "() => getComputedStyle(document.body).fontFamily"
playwright-cli close
playwright-cli --help   # full command list (resize, eval, snapshot, etc.)
```

`npx playwright-cli` is the local command for a project-local install. `npx playwright cli` belongs to a different package.

#### Probes
`skills/thooku/scripts/` holds three probes, each run with `playwright-cli run-code --filename=<file>`:
- `stack-probe.js` detects frameworks and motion libraries.
- `animations-probe.js` lists running animations.
- `motion-probe.js` measures one interaction (copy it, then edit selector, trigger, and props).

Usage and result fields are in `references/js-inspection.md`.

Official docs:
- https://playwright.dev/agent-cli/installation
- https://playwright.dev/agent-cli/skills

### Option B — Python + Playwright
```bash
python3 -m pip install playwright beautifulsoup4 tinycss2
python3 -m playwright install chromium
```
Use Playwright to load and inspect pages, and Beautiful Soup/tinycss2 for static parsing. These are free/open-source. Browser downloads require disk space; some Linux environments need system libraries.

### Option C — Static-only inspection
Use `curl` plus Python HTML/CSS parsers if browser automation is unavailable. This can inspect markup, linked CSS, fonts and assets, but cannot reliably reveal JavaScript-driven menus, transitions, scroll behavior, or authenticated flows.

## Optional free helpers
- Browser DevTools: built into Chromium-based browsers.
- Lighthouse: free performance/accessibility audits (not a full design scraper).
- axe-core: open-source accessibility testing.
- ImageMagick: optional local image dimension/format checks.
- Mermaid: text-based flow diagrams; no paid service required for local rendering.

## Paid products are not required
Avoid requiring paid visual-scraping SaaS, hosted browser APIs, paid screenshot APIs, commercial font subscriptions, or proprietary icon packs. If the target uses a paid font or icon set, identify a genuinely free licensed substitute (for example, a system font stack, a suitable Google Fonts family, or Lucide icons) and state any visual differences. Check current licenses and terms before redistribution.

## Operational notes
- Browser automation may fail on sites with bot protection, login requirements, or unusual rendering. Do not bypass these protections. Detect them with `scripts/access-probe.js` and follow `blocked-access.md`.
- Public availability does not imply permission to reuse copyrighted images, text, logos, or source code.
- Browser access and dependency installation may be unavailable in some Claude surfaces. In that case, report the limitation and provide a static-analysis plan.

## Multi-site usage and efficiency

For a list of websites, provide all URLs in one prompt and specify whether the goal is comparison or synthesis. Thooku should:
- keep each site's evidence separate;
- use the same viewport sizes and inspection checklist;
- inspect representative page templates rather than crawling every URL;
- deduplicate shared assets within each origin;
- report the exact pages inspected and any failures;
- build a comparison matrix before proposing a unified design system.

Suggested prompt:
```text
/thooku

Analyze these websites:
- https://site-one.example
- https://site-two.example
- https://site-three.example

Compare layout, typography, tokens, components, animations,
responsive behavior and key user flows. Then propose a unified
React design system inspired by the best patterns, using free
dependencies and original/licensed assets only. Keep source
evidence separate and identify conflicts and unknowns.
```
