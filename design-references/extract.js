const { chromium } = require('playwright');
const fs = require('fs');
const [,, slug, url, outDir] = process.argv;
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ignoreHTTPSErrors: false,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36' });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  // scroll through
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < Math.min(h, 20000); y += 800) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(150); }
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(500);
  const data = await page.evaluate(() => {
    const hex = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return c; const p = m[1].split(/[, /]+/).filter(Boolean).map(Number);
      if (p.length > 3 && p[3] === 0) return null; const h = p.slice(0,3).map(v => Math.round(v).toString(16).padStart(2,'0')).join('');
      return '#' + h + (p.length > 3 && p[3] < 1 ? ` @${p[3]}` : ''); };
    const bump = (m, k, w = 1) => { if (k == null) return; m[k] = (m[k] || 0) + w; };
    const top = (m, n = 12) => Object.entries(m).sort((a,b) => b[1]-a[1]).slice(0, n).map(([k,v]) => [k, Math.round(v)]);
    const bg = {}, fg = {}, border = {}, radius = {}, shadow = {}, fam = {}, size = {}, weight = {}, trans = {}, maxw = {}, padY = {}, gap = {};
    const all = [...document.querySelectorAll('body *')];
    for (const el of all) {
      const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
      const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none') continue;
      const area = Math.min(r.width * r.height, 1440*900) / 1000;
      bump(bg, hex(s.backgroundColor), area);
      const txt = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
      if (txt.length) { bump(fg, hex(s.color), txt.length); bump(fam, s.fontFamily.split(',').slice(0,2).join(',').trim(), txt.length); bump(size, s.fontSize, txt.length); bump(weight, s.fontWeight, txt.length); }
      if (parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== 'none') bump(border, s.borderTopWidth + ' ' + hex(s.borderTopColor));
      if (s.borderTopLeftRadius !== '0px') bump(radius, s.borderTopLeftRadius);
      if (s.boxShadow !== 'none') bump(shadow, s.boxShadow.replace(/rgba?\([^)]+\)/g, m => hex(m)));
      if (s.transitionDuration !== '0s') bump(trans, s.transitionDuration.split(',')[0] + ' ' + s.transitionTimingFunction.split(/,(?![^(]*\))/)[0]);
      if (s.maxWidth !== 'none' && parseFloat(s.maxWidth) > 600 && r.width > 600) bump(maxw, s.maxWidth);
      if ((el.tagName === 'SECTION' || r.width > 1200) && parseFloat(s.paddingTop) >= 32) bump(padY, s.paddingTop + '/' + s.paddingBottom);
      if ((s.display.includes('flex') || s.display.includes('grid')) && s.rowGap !== 'normal' && s.rowGap !== '0px') bump(gap, s.rowGap);
    }
    const desc = (el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect();
      return { text: (el.innerText || el.value || '').trim().replace(/\s+/g,' ').slice(0, 50), font: s.fontFamily.split(',')[0].trim(), size: s.fontSize, weight: s.fontWeight, lh: s.lineHeight, ls: s.letterSpacing,
        color: hex(s.color), bg: hex(s.backgroundColor), bgImage: s.backgroundImage === 'none' ? undefined : s.backgroundImage.slice(0,120), radius: s.borderTopLeftRadius, pad: s.padding, border: parseFloat(s.borderTopWidth) > 0 ? s.borderTopWidth + ' ' + hex(s.borderTopColor) : undefined,
        shadow: s.boxShadow === 'none' ? undefined : s.boxShadow.replace(/rgba?\([^)]+\)/g, m => hex(m)).slice(0,160), transform: s.textTransform === 'none' ? undefined : s.textTransform, h: Math.round(r.height), w: Math.round(r.width) }; };
    const pick = (sel, n) => { const seen = new Set(), out = []; for (const el of document.querySelectorAll(sel)) { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue; const d = desc(el); if (!d.text && !sel.includes('input')) continue; const k = [d.font,d.size,d.weight,d.color,d.bg,d.radius,d.pad].join('|'); if (seen.has(k)) continue; seen.add(k); out.push(d); if (out.length >= n) break; } return out; };
    const vars = {}; 
    for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch (e) { continue; }
      for (const rule of rules) { if (rule.selectorText && /^(:root|html|body)(,|$|\s)/.test(rule.selectorText) && rule.style) for (const p of rule.style) if (p.startsWith('--')) { const v = rule.style.getPropertyValue(p).trim(); if (v.length < 90) vars[p] = v; } } }
    const b = getComputedStyle(document.body);
    return { title: document.title, body: { bg: hex(b.backgroundColor), htmlBg: hex(getComputedStyle(document.documentElement).backgroundColor), color: hex(b.color), font: b.fontFamily, size: b.fontSize, lh: b.lineHeight },
      h1: pick('h1', 3), h2: pick('h2', 4), h3: pick('h3', 3), p: pick('p', 5), nav: pick('header a, nav a', 4), buttons: pick('button, a[class*="button" i], a[class*="btn" i], [role="button"]', 10), inputs: pick('input:not([type=hidden]), textarea', 3), footer: pick('footer a, footer p, footer h3, footer h4', 3),
      header: (() => { const el = document.querySelector('header, nav'); return el ? Object.assign(desc(el), { text: undefined, position: getComputedStyle(el).position, backdrop: getComputedStyle(el).backdropFilter }) : null; })(),
      freq: { bg: top(bg), fg: top(fg), border: top(border, 8), radius: top(radius, 10), shadow: top(shadow, 6), fontFamily: top(fam, 6), fontSize: top(size, 14), fontWeight: top(weight, 6), transition: top(trans, 6), maxWidth: top(maxw, 6), sectionPadY: top(padY, 8), gap: top(gap, 10) },
      varCount: Object.keys(vars).length, vars };
  });
  // trim vars: keep colour/font/radius/space-ish first 70
  const keys = Object.keys(data.vars).filter(k => /color|bg|background|text|font|radius|space|spacing|shadow|accent|brand|primary|gray|grey|ease|duration|size/i.test(k)).slice(0, 70);
  data.vars = Object.fromEntries(keys.map(k => [k, data.vars[k]]));
  const fonts = await page.evaluate(() => [...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g,'') + ' ' + f.weight))].slice(0, 20));
  data.loadedFonts = fonts; data.url = page.url();
  fs.writeFileSync(`${outDir}/${slug}.json`, JSON.stringify(data, null, 1));
  await page.screenshot({ path: `${outDir}/${slug}.png` });
  await browser.close();
  console.log(slug, 'ok', data.title);
})().catch(e => { console.log(slug, 'FAIL', e.message.split('\n')[0]); process.exit(0); });
