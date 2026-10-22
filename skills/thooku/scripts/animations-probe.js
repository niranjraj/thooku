// thooku animations probe: lists every animation running on the page right now
// (page-load reveals, looping animations, marquees, spinners).
// Usage: playwright-cli run-code --filename=<skill-dir>/scripts/animations-probe.js
//    or: pass this file's contents to the Playwright MCP tool browser_run_code.
async page => page.evaluate(() =>
  document.getAnimations().map(a => {
    const t = a.effect.getTiming();
    const kf = a.effect.getKeyframes();
    const el = a.effect.target;
    return {
      type: a.constructor.name,
      name: a.animationName || a.transitionProperty || a.id || null,
      target: el ? el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '') : null,
      playState: a.playState,
      duration: t.duration,
      delay: t.delay,
      easing: t.easing !== 'linear' ? t.easing : (kf[0]?.easing ?? 'linear'),
      iterations: t.iterations === Infinity ? 'infinite' : t.iterations,
      direction: t.direction,
      keyframes: kf.map(({ offset, easing, composite, computedOffset, ...rest }) => ({ offset: computedOffset, ...rest })),
    };
  })
)
