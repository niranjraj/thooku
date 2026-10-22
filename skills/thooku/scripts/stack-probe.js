// thooku stack probe: detects front-end frameworks, motion libraries, and motion-related page facts.
// Usage: playwright-cli run-code --filename=<skill-dir>/scripts/stack-probe.js
//    or: pass this file's contents to the Playwright MCP tool browser_run_code.
// Every hit is a heuristic. Report it as Observed (global or DOM marker found) or Inferred (script URL only).
async page => page.evaluate(() => {
  const q = s => !!document.querySelector(s);
  const w = k => typeof window[k] !== 'undefined';
  const scripts = [...document.scripts].map(s => s.src).filter(Boolean);
  const srcHas = re => scripts.some(s => re.test(s));
  const hit = (name, evidence) => (evidence ? name : null);
  return {
    generator: document.querySelector('meta[name="generator"]')?.content ?? null,
    frameworks: [
      hit('Next.js', w('__NEXT_DATA__') || q('#__next') || srcHas(/\/_next\//)),
      hit('Nuxt', w('__NUXT__') || q('#__nuxt')),
      hit('React', q('[data-reactroot]') || w('__REACT_DEVTOOLS_GLOBAL_HOOK__') && !!document.querySelector('#root,#__next')),
      hit('Vue', w('__VUE__') || q('[data-v-app]')),
      hit('Svelte/SvelteKit', q('[class*="svelte-"]') || srcHas(/\/_app\/immutable\//)),
      hit('Astro', q('astro-island') || srcHas(/\/_astro\//)),
      hit('Angular', q('[ng-version]')),
      hit('Gatsby', q('#___gatsby')),
      hit('Remix', w('__remixContext')),
      hit('Webflow', q('html[data-wf-site]') || w('Webflow')),
      hit('Framer (site builder)', q('[data-framer-name]') || srcHas(/framerusercontent\.com/)),
      hit('WordPress', q('link[href*="wp-content"],script[src*="wp-content"]')),
      hit('Shopify', w('Shopify')),
    ].filter(Boolean),
    motion: [
      hit('GSAP', w('gsap') || w('TweenMax') || srcHas(/gsap/i)),
      hit('GSAP ScrollTrigger', w('ScrollTrigger') || srcHas(/ScrollTrigger/i)),
      hit('Lenis smooth scroll', q('html.lenis') || w('Lenis') || srcHas(/lenis/i)),
      hit('Locomotive Scroll', q('[data-scroll-container]') || srcHas(/locomotive/i)),
      hit('Barba.js page transitions', w('barba') || q('[data-barba="wrapper"]')),
      hit('Swup page transitions', w('swup') || q('#swup')),
      hit('AOS scroll reveal', w('AOS') || q('[data-aos]')),
      hit('Lottie', w('lottie') || w('bodymovin') || q('lottie-player,dotlottie-player')),
      hit('Rive', q('canvas[class*="rive"]') || srcHas(/rive/i)),
      hit('Three.js / WebGL', w('THREE') || srcHas(/three(\.module)?(\.min)?\.js/i)),
      hit('Swiper', w('Swiper') || q('.swiper')),
      hit('Splide', q('.splide')),
      hit('Embla', q('[class*="embla"]')),
      hit('Framer Motion / Motion (inferred: inline transform styles + React)', q('[style*="transform"][data-projection-id]') || srcHas(/framer-motion|\/motion\//i)),
      hit('View Transitions API', !!document.startViewTransition && [...document.styleSheets].some(s => { try { return [...s.cssRules].some(r => r.cssText.includes('view-transition')); } catch { return false; } })),
    ].filter(Boolean),
    canvases: document.querySelectorAll('canvas').length,
    videos: document.querySelectorAll('video').length,
    runningAnimations: document.getAnimations().length,
    reducedMotionRules: [...document.styleSheets].reduce((n, s) => { try { return n + [...s.cssRules].filter(r => r.media?.mediaText?.includes('prefers-reduced-motion')).length; } catch { return n; } }, 0),
    crossOriginStylesheets: [...document.styleSheets].filter(s => { try { s.cssRules; return false; } catch { return true; } }).map(s => s.href),
    scripts: scripts.slice(0, 40),
  };
})
