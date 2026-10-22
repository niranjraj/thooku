# Thooku tooling: free-first setup

Thooku itself is an instruction skill. It does not require a paid API. Its ability to inspect live websites depends on the runtime and tools available to the agent.

## Recommended free stack

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
- Browser automation may fail on sites with bot protection, login requirements, or unusual rendering. Do not bypass these protections.
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
