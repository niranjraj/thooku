// thooku motion probe: measures one interaction on one element.
// Copy this file to a scratch directory, edit selector, trigger, and props, then run:
//   playwright-cli run-code --filename=<copy>/motion-probe.js
// `animations` lists CSS transitions, CSS animations, and Web Animations API effects with exact timing (Measured).
// `sampled` is frame-by-frame computed style. Use it for JS-driven motion (GSAP, rAF loops); its duration is accurate to about one frame (~17 ms).
async page => {
  // Edit these three lines for each interaction you measure.
  const selector = 'a';
  const trigger = el => el.hover();   // or el.click(), el.focus(), page.mouse.wheel(0, 600)
  const props = ['transform', 'opacity', 'color', 'background-color', 'box-shadow', 'height', 'clip-path'];

  const windowMs = 2000;
  const el = page.locator(selector).first();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(800); // let any previous state settle
  await el.evaluate((node, { props, windowMs }) => {
    const samples = [];
    const seen = new Map();
    const t0 = performance.now();
    const describe = a => {
      const t = a.effect.getTiming();
      const kf = a.effect.getKeyframes();
      return {
        type: a.constructor.name,
        name: a.animationName || a.transitionProperty || a.id || null,
        target: a.effect.target?.tagName?.toLowerCase() + (a.effect.target?.className && typeof a.effect.target.className === 'string' ? '.' + a.effect.target.className.trim().split(/\s+/).join('.') : ''),
        duration: t.duration,
        delay: t.delay,
        easing: t.easing !== 'linear' ? t.easing : (kf[0]?.easing ?? 'linear'),
        iterations: t.iterations === Infinity ? 'infinite' : t.iterations,
        keyframes: kf.map(({ offset, easing, composite, computedOffset, ...rest }) => ({ offset: computedOffset, ...rest })),
      };
    };
    const tick = () => {
      const now = performance.now() - t0;
      samples.push({ t: Math.round(now), ...Object.fromEntries(props.map(p => [p, getComputedStyle(node).getPropertyValue(p)])) });
      for (const a of document.getAnimations()) if (!seen.has(a)) seen.set(a, describe(a));
      if (now < windowMs) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    window.__thookuMotion = { samples, seen };
  }, { props, windowMs });
  await trigger(el);
  await page.waitForTimeout(windowMs + 100);
  return page.evaluate(() => {
    const { samples, seen } = window.__thookuMotion;
    const key = s => JSON.stringify({ ...s, t: 0 });
    const final = key(samples.at(-1));
    const firstChange = samples.find((s, i) => i > 0 && key(s) !== key(samples[0]));
    const settled = samples.find(s => key(s) === final && (!firstChange || s.t >= firstChange.t));
    return {
      animations: [...seen.values()],
      sampled: {
        startMs: firstChange?.t ?? null,
        settledMs: settled?.t ?? null,
        approxDurationMs: firstChange && settled ? settled.t - firstChange.t : 0,
        from: samples[0],
        to: samples.at(-1),
      },
    };
  });
}
