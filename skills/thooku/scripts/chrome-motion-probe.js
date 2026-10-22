// thooku motion probe for Claude in Chrome: measures one interaction on one element.
// Claude in Chrome has no single call that triggers and measures, so this probe records on its own clock
// and you trigger the interaction between two calls:
//   1. Copy this file to a scratch directory, edit selector, props, and windowMs, and send it to javascript_tool.
//   2. Within windowMs, trigger the interaction with the `computer` tool (hover, click, scroll).
//   3. After windowMs, send `window.__thookuRead()` to javascript_tool.
// Timestamps come from the page, so tool round-trip time does not enter the measurement.
// Fields match motion-probe.js. `sampled.startMs` is relative to step 1, so only `approxDurationMs` and `animations` are the timing.
(() => {
  // Edit these lines for each interaction you measure.
  const selector = 'a';
  const props = ['transform', 'opacity', 'color', 'background-color', 'box-shadow', 'height', 'clip-path'];
  const windowMs = 8000; // must cover your trigger call plus the motion itself

  const node = document.querySelector(selector);
  if (!node) return { error: 'selector matched nothing: ' + selector };
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
  window.__thookuRead = () => {
    const key = s => JSON.stringify({ ...s, t: 0 });
    const final = key(samples.at(-1));
    const firstChange = samples.find((s, i) => i > 0 && key(s) !== key(samples[0]));
    const settled = samples.find(s => key(s) === final && (!firstChange || s.t >= firstChange.t));
    return {
      recording: performance.now() - t0 < windowMs,
      animations: [...seen.values()],
      sampled: {
        startMs: firstChange?.t ?? null,
        settledMs: settled?.t ?? null,
        approxDurationMs: firstChange && settled ? settled.t - firstChange.t : 0,
        from: samples[0],
        to: samples.at(-1),
      },
    };
  };
  return 'recording ' + windowMs + ' ms: trigger the interaction now';
})()
