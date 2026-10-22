# Thooku JavaScript and motion inspection

Three Playwright CLI probes live in `scripts/`. Each file's header comment explains its use. They need a running browser session (`playwright-cli open <url>`; see `tooling.md`).

Do not deobfuscate, reformat, or reproduce proprietary JavaScript. Read loaded scripts only to identify libraries and behavior.

## Running a probe

```bash
playwright-cli run-code --filename=<skill-dir>/scripts/stack-probe.js
playwright-cli run-code --filename=<skill-dir>/scripts/animations-probe.js
```

Each CLI command takes about 1 s. Use `npx playwright-cli` if the CLI is project-local. (`npx playwright cli` is a different package.)

## stack-probe.js

Detects frameworks (Next, Nuxt, React, Vue, Svelte, Astro, Angular, Gatsby, Remix, Webflow, Framer, WordPress, Shopify) and motion libraries (GSAP, ScrollTrigger, Lenis, Locomotive, Barba, Swup, AOS, Lottie, Rive, Three.js, Swiper, Splide, Embla, Framer Motion, View Transitions). Run it once per template, after the page has loaded.

| Field | Meaning |
| --- | --- |
| `generator` | `<meta name="generator">` content, or `null` |
| `frameworks` | Detected frameworks |
| `motion` | Detected motion, scroll, and carousel libraries |
| `canvases`, `videos` | Element counts. Canvas or WebGL motion is not visible to `getAnimations()` |
| `runningAnimations` | `document.getAnimations().length` at probe time |
| `reducedMotionRules` | Count of `prefers-reduced-motion` rules in readable stylesheets |
| `crossOriginStylesheets` | Stylesheet URLs whose rules the page cannot read (see below) |
| `scripts` | First 40 script URLs |

Every hit is a heuristic. Label it `Observed` when a global or DOM marker matched. Label it `Inferred` when only a script URL matched.

## animations-probe.js

Lists every animation running now: page-load reveals, loops, marquees, spinners. Run it right after load, and again after scrolling if entrance motion is scroll-triggered.

| Field | Meaning |
| --- | --- |
| `type` | `CSSTransition`, `CSSAnimation`, or `Animation` (Web Animations API) |
| `name` | Animation name or transition property |
| `target` | Tag, id, and first three classes of the animated element |
| `playState`, `duration`, `delay`, `direction` | Timing in ms, as reported by the browser |
| `easing` | Real easing curve (see easing note) |
| `iterations` | Count, or `"infinite"` |
| `keyframes` | Offset and animated properties per keyframe |

Values from `getAnimations()` are `Measured`.

## motion-probe.js

Measures one interaction on one element. Copy it to a scratch directory. Do not edit the skill's copy. Edit the three lines at the top of the copy:

```js
const selector = '.btn-primary';
const trigger = el => el.hover();   // see examples below
const props = ['transform', 'opacity', 'background-color'];
```

Trigger examples:

```js
const trigger = el => el.hover();
const trigger = el => el.click();           // only for safe, reversible clicks
const trigger = el => el.focus();
const trigger = () => page.mouse.wheel(0, 600);   // scroll-linked effects
```

Then run it:

```bash
playwright-cli run-code --filename=<copy>/motion-probe.js
```

The probe moves the mouse away, waits 800 ms, samples the listed computed styles every frame for 2000 ms, and fires the trigger in the same call. It records every animation seen through `document.getAnimations()`.

Result fields:

| Field | Meaning |
| --- | --- |
| `animations` | Same shape as animations-probe. Exact timing: `Measured` |
| `sampled.startMs` | Time of the first style change, relative to sampling start |
| `sampled.settledMs` | Time the styles reach their final value |
| `sampled.approxDurationMs` | `settledMs - startMs`. `Measured ±1 frame` (about 17 ms) |
| `sampled.from`, `sampled.to` | First and last sampled values of the listed properties |

When `animations` has an entry, use its duration and easing. When it is empty but `sampled` shows change, the motion is JS-driven (GSAP, rAF loop, Motion). It has no `getAnimations()` entry. Report the frame-sampled duration, and name the library from stack-probe. Easing for JS-driven motion is `Unknown` unless the library's config is visible.

## Notes

**Easing.** For CSS animations, `effect.getTiming().easing` returns `"linear"`. The real easing is in `getKeyframes()[0].easing`. The probes already read it.

**Infinity.** `iterations: Infinity` serializes to `null` in JSON. The probes map it to `"infinite"`.

**One-call timing rule.** A short transition finishes between separate `hover` and `eval` CLI calls (about 1 s apart). Trigger and measurement must run in one `run-code` call. Never measure motion with separate trigger and read commands.

**Cross-origin stylesheets.** CSS rules in cross-origin stylesheets cannot be read through `document.styleSheets`. Fetch the stylesheet URL from `crossOriginStylesheets` directly (`curl`) and read the declaration there. Quote declarations briefly. Do not copy whole stylesheets.

## Library to free reimplementation

| Detected | Free path | Notes |
| --- | --- | --- |
| GSAP | CSS transitions, Web Animations API, or GSAP itself | GSAP became free in 2025, including its plugins. Verify the current license. |
| Lenis | Lenis | MIT |
| Locomotive Scroll | Lenis | Verify license. |
| Lottie | lottie-web | MIT. The animation JSON file may have its own license. Verify. |
| Barba, Swup | View Transitions API | Native. Check browser support for your audience. |
| ScrollTrigger | CSS `animation-timeline: scroll()` / `view()`, or IntersectionObserver | CSS scroll-timeline has limited browser support. Verify. |
| Framer Motion / Motion | Motion | MIT. Verify license. |
| Swiper, Splide, Embla | Same library, or CSS scroll-snap | All MIT. Verify license. |
| Three.js | Three.js | MIT |

If a license is unclear, mark it `verify license`.
