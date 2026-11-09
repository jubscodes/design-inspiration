#!/usr/bin/env node
/**
 * build-moodboard.js — build a self-contained HTML moodboard from a manifest.
 *
 * Usage:
 *   node build-moodboard.js manifest.json [-o moodboard.html] [--max-width 1200]
 *
 * Images and videos (URLs or paths relative to the manifest) are embedded as
 * data: URIs, so the output renders offline and can be emailed. Remote images
 * are downscaled with ffmpeg or sips when available; otherwise embedded as-is.
 * Downloads prefer curl (respects proxies), falling back to fetch().
 * Node builtins only.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const UA = 'design-inspiration/1.0';
const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm',
};

const has = (cmd) => spawnSync(process.platform === 'win32' ? 'where' : 'which', [cmd]).status === 0;
const HAS_CURL = has('curl');
const HAS_FFMPEG = has('ffmpeg');
const HAS_SIPS = has('sips');

function parseArgs(argv) {
  const a = { manifest: null, out: 'moodboard.html', maxWidth: 1200 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '-o' || argv[i] === '--out') a.out = argv[++i];
    else if (argv[i] === '--max-width') a.maxWidth = parseInt(argv[++i], 10) || 1200;
    else if (!a.manifest) a.manifest = argv[i];
  }
  if (!a.manifest) {
    console.error('Usage: node build-moodboard.js manifest.json [-o moodboard.html] [--max-width 1200]');
    process.exit(1);
  }
  return a;
}

async function fetchBytes(src, baseDir) {
  if (/^https?:\/\//.test(src)) {
    const guess = MIME[path.extname(new URL(src).pathname).toLowerCase()];
    if (HAS_CURL) {
      const r = spawnSync('curl', ['-sSfL', '--retry', '2', '-m', '60', '-A', UA, '-w', '\n%{content_type}', src],
        { maxBuffer: 256 * 1024 * 1024 });
      if (r.status !== 0) throw new Error((r.stderr || '').toString().trim() || `curl exit ${r.status}`);
      const buf = r.stdout;
      const nl = buf.lastIndexOf(10);
      const ctype = buf.slice(nl + 1).toString().split(';')[0].trim();
      return { data: buf.slice(0, nl), mime: ctype || guess || 'application/octet-stream' };
    }
    const res = await fetch(src, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ctype = (res.headers.get('content-type') || '').split(';')[0].trim();
    return { data: Buffer.from(await res.arrayBuffer()), mime: ctype || guess || 'application/octet-stream' };
  }
  const p = path.isAbsolute(src) ? src : path.join(baseDir, src);
  return { data: fs.readFileSync(p), mime: MIME[path.extname(p).toLowerCase()] || 'application/octet-stream' };
}

function downscale(data, mime, maxWidth) {
  if (!(HAS_FFMPEG || HAS_SIPS) || /gif|svg/.test(mime)) return { data, mime };
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'moodboard-'));
  const inp = path.join(dir, 'in');
  const out = path.join(dir, 'out.jpg');
  try {
    fs.writeFileSync(inp, data);
    if (HAS_FFMPEG) {
      execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', inp, '-frames:v', '1',
        '-vf', `scale='min(${maxWidth},iw)':-2`, '-q:v', '4', out], { stdio: 'ignore' });
    } else {
      execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '78',
        '--resampleWidth', String(maxWidth), inp, '--out', out], { stdio: 'ignore' });
    }
    const small = fs.readFileSync(out);
    return small.length < data.length ? { data: small, mime: 'image/jpeg' } : { data, mime };
  } catch {
    return { data, mime };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const dataUri = ({ data, mime }) => `data:${mime};base64,${data.toString('base64')}`;

async function embedImage(item, baseDir, maxWidth) {
  if (!item.image) return null;
  try {
    const got = await fetchBytes(item.image, baseDir);
    const remote = /^https?:/.test(item.image);
    return dataUri(remote ? downscale(got.data, got.mime, maxWidth) : got);
  } catch (e) {
    console.error(`warn: could not embed ${item.image}: ${e.message}`);
    return null;
  }
}

async function embedVideo(item, baseDir) {
  if (!item.video) return null;
  try {
    const got = await fetchBytes(item.video, baseDir);
    if (!got.mime.startsWith('video/')) got.mime = item.video.endsWith('.webm') ? 'video/webm' : 'video/mp4';
    if (got.data.length > 3e6) console.error(`warn: ${item.video} is ${(got.data.length / 1e6).toFixed(1)} MB; consider shrinking with ffmpeg`);
    return dataUri(got);
  } catch (e) {
    console.error(`warn: could not embed video ${item.video}: ${e.message}`);
    return null;
  }
}

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k]); }
  }));
  return out;
}

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function card(item, img, vid) {
  const meta = [item.author, item.source].filter(Boolean).map(esc).join(' · ');
  const links = [];
  if (item.url) links.push(`<a href="${esc(item.url)}" target="_blank" rel="noopener">Source</a>`);
  const orig = item.original || item.live;
  if (orig) links.push(`<a href="${esc(orig)}" target="_blank" rel="noopener">Original</a>`);
  const tags = (item.tags || []).map((t) => `<li>${esc(t)}</li>`).join('');
  const label = `Enlarge ${esc(item.title)}`;
  let shot;
  if (vid) shot = `<button class="shot" data-full aria-label="${label}"><video src="${vid}"${img ? ` poster="${img}"` : ''} autoplay muted loop playsinline preload="auto"></video></button>`;
  else if (img) shot = `<button class="shot" data-full aria-label="${label}"><img src="${img}" alt="${esc(item.title)}" loading="lazy"></button>`;
  else shot = '<div class="shot missing">Image unavailable</div>';
  return `<figure class="card">${shot}<figcaption>
  ${item.title ? `<h3>${esc(item.title)}</h3>` : ''}
  ${meta ? `<p class="meta">${meta}</p>` : ''}
  ${item.why ? `<p class="why">${esc(item.why)}</p>` : ''}
  ${tags ? `<ul class="tags">${tags}</ul>` : ''}
  ${links.length ? `<p class="links">${links.join(' ')}</p>` : ''}
</figcaption></figure>`;
}

const CSS = `
:root{--bg:#f6f4f0;--fg:#1c1a17;--muted:#6b665e;--line:#e2ddd4;--card:#fff;--chip:#efebe4}
@media (prefers-color-scheme:dark){:root{--bg:#141311;--fg:#ece8e1;--muted:#9a948a;--line:#2b2925;--card:#1c1b18;--chip:#26241f}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 -apple-system,BlinkMacSystemFont,"Helvetica Neue",Helvetica,Arial,sans-serif}
.wrap{max-width:1440px;margin:0 auto;padding:48px 24px 96px}
header{border-bottom:1px solid var(--line);padding-bottom:28px;margin-bottom:40px}
.eyebrow{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:0 0 8px}
h1{font-size:clamp(32px,5vw,56px);line-height:1.05;letter-spacing:-.02em;margin:0 0 16px;font-weight:600}
.brief{max-width:68ch;font-size:17px;margin:0}
.assume{max-width:68ch;color:var(--muted);font-size:13px;margin:10px 0 0}
.palette{display:flex;gap:8px;margin-top:22px;flex-wrap:wrap}
.sw{border:0;cursor:pointer;width:72px;height:72px;border-radius:10px;display:flex;align-items:flex-end;padding:6px;font:11px ui-monospace,Menlo,monospace;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.5)}
section{margin-bottom:56px}
section h2{font-size:22px;letter-spacing:-.01em;margin:0 0 4px;font-weight:600}
section .note{color:var(--muted);margin:0 0 20px;max-width:70ch}
.grid{columns:320px;column-gap:20px}
.card{break-inside:avoid;margin:0 0 20px;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}
.shot{display:block;width:100%;padding:0;border:0;background:none;cursor:zoom-in}
.shot img,.shot video{display:block;width:100%;height:auto}
.missing{padding:40px;text-align:center;color:var(--muted);background:var(--chip);cursor:default}
figcaption{padding:14px 16px 16px}
figcaption h3{font-size:15px;margin:0;font-weight:600}
.meta{color:var(--muted);font-size:13px;margin:2px 0 0}
.why{margin:10px 0 0}
.tags{list-style:none;padding:0;margin:12px 0 0;display:flex;flex-wrap:wrap;gap:6px}
.tags li{background:var(--chip);border-radius:99px;padding:2px 10px;font-size:12px;color:var(--muted)}
.links{margin:12px 0 0;font-size:13px;display:flex;gap:14px}
.links a{color:var(--fg)}
footer{color:var(--muted);font-size:12px;border-top:1px solid var(--line);padding-top:20px}
#lb{position:fixed;inset:0;background:rgba(0,0,0,.88);display:none;align-items:center;justify-content:center;padding:24px;cursor:zoom-out;z-index:9}
#lb.on{display:flex}#lb img,#lb video{max-width:100%;max-height:100%;border-radius:6px}
@media (max-width:600px){.wrap{padding:28px 16px 64px}.grid{columns:1}}
@media print{#lb{display:none!important}.card{border-color:#ccc}}
`;

const JS = `
const lb=document.getElementById('lb');
const close=()=>{lb.classList.remove('on');lb.innerHTML=''};
document.querySelectorAll('[data-full]').forEach(b=>b.addEventListener('click',()=>{const m=b.querySelector('img,video').cloneNode();if(m.tagName==='VIDEO'){m.muted=true;m.controls=true;m.autoplay=true;m.loop=true}lb.innerHTML='';lb.appendChild(m);lb.classList.add('on')}));
lb.addEventListener('click',e=>{if(e.target===lb)close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.querySelectorAll('.shot video').forEach(v=>{v.removeAttribute('autoplay');v.pause()});
document.querySelectorAll('.sw').forEach(s=>s.addEventListener('click',()=>{try{navigator.clipboard.writeText(s.dataset.hex)}catch(e){}}));
`;

async function build(manifest, baseDir, maxWidth) {
  const groups = manifest.groups || [];
  const items = groups.flatMap((g) => g.items || []);
  const imgs = await pool(items, 4, (it) => embedImage(it, baseDir, maxWidth));
  const vids = await pool(items, 4, (it) => embedVideo(it, baseDir));
  const idx = new Map(items.map((it, k) => [it, k]));

  const sections = groups.map((g) => {
    const cards = (g.items || []).map((it) => card(it, imgs[idx.get(it)], vids[idx.get(it)])).join('\n');
    return `<section><h2>${esc(g.name)}</h2>
${g.note ? `<p class="note">${esc(g.note)}</p>` : ''}
<div class="grid">${cards}</div></section>`;
  }).join('');

  const swatches = (manifest.palette || []).map((c) =>
    `<button class="sw" style="background:${esc(c)}" data-hex="${esc(c)}" title="Copy ${esc(c)}">${esc(c)}</button>`).join('');
  const sources = [...new Set(items.map((it) => it.source).filter(Boolean))].sort();
  const missing = items.filter((_, k) => !imgs[k] && !vids[k]).length;
  const title = esc(manifest.title || 'Moodboard');

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><style>${CSS}</style></head>
<body><div class="wrap"><header>
<p class="eyebrow">Moodboard${manifest.date ? ` · ${esc(manifest.date)}` : ''} · ${items.length} references</p>
<h1>${title}</h1>
${manifest.brief ? `<p class="brief">${esc(manifest.brief)}</p>` : ''}
${manifest.assumptions ? `<p class="assume">Assumptions: ${esc(manifest.assumptions)}</p>` : ''}
${swatches ? `<div class="palette">${swatches}</div>` : ''}
</header>
${sections}
<footer>Sources: ${esc(sources.join(', ')) || 'various'}. References are collected for inspiration and belong to their authors.</footer>
</div><div id="lb" role="dialog" aria-label="Enlarged view"></div><script>${JS}</script></body></html>`;
  return { html, count: items.length, missing };
}

async function main() {
  const a = parseArgs(process.argv.slice(2));
  const manifest = JSON.parse(fs.readFileSync(a.manifest, 'utf8'));
  const { html, count, missing } = await build(manifest, path.dirname(path.resolve(a.manifest)), a.maxWidth);
  fs.writeFileSync(a.out, html);
  const mb = (fs.statSync(a.out).size / 1e6).toFixed(1);
  console.log(`wrote ${a.out} — ${count} references, ${missing} missing, ${mb} MB`);
  process.exit(count && missing === count ? 1 : 0);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
