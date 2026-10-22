// thooku access probe: classifies whether the loaded page is the real site or a block, challenge, or login wall.
// Usage: playwright-cli run-code --filename=<skill-dir>/scripts/access-probe.js
//    or: pass this file's contents to the Playwright MCP tool browser_run_code.
// Run it right after navigation, before any other probe. It only reads the page. It never clicks, solves, or waits out a challenge.
// If `verdict` is not "ok", stop inspecting this origin and follow references/blocked-access.md.
async page => page.evaluate(() => {
  const nav = performance.getEntriesByType('navigation')[0];
  const status = nav?.responseStatus || null;
  const title = document.title || '';
  const text = (document.body?.innerText || '').slice(0, 2000);
  const has = re => re.test(title) || re.test(text);
  const q = s => !!document.querySelector(s);

  const signals = [];
  if (status && status >= 400) signals.push(`http-${status}`);
  if (has(/just a moment|checking your browser|verify(ing)? you are human|attention required/i)) signals.push('challenge-text');
  if (q('iframe[src*="challenges.cloudflare.com"],iframe[src*="hcaptcha.com"],iframe[src*="recaptcha"],#challenge-form,#cf-challenge-running,.cf-turnstile,.g-recaptcha,.h-captcha')) signals.push('captcha-widget');
  if (has(/access denied|request blocked|forbidden|unusual traffic|are you a robot/i)) signals.push('denied-text');
  if (q('input[type="password"]') && (document.body?.innerText.length ?? 0) < 1500) signals.push('login-wall');
  if ((document.body?.innerText.trim().length ?? 0) < 40 && !q('canvas,video,svg')) signals.push('near-empty-body');

  const verdict =
    signals.some(s => s === 'captcha-widget' || s === 'challenge-text') ? 'challenge' :
    signals.includes('login-wall') ? 'login' :
    signals.some(s => s.startsWith('http-') || s === 'denied-text') ? 'blocked' :
    signals.includes('near-empty-body') ? 'unclear' :
    'ok';

  return {
    verdict,
    status,
    title,
    url: location.href,
    redirected: nav ? nav.redirectCount > 0 : null,
    signals,
  };
})
