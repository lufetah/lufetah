// Renders the entire profile "page" as one cohesive SVG (path bar → hero →
// stats → about → activity chart → currently → footer). One image = no seams,
// matches design/preview.html. Connect links live in the README as clickable
// badges instead, because <a> inside an <img>-loaded SVG isn't clickable.
import { color as C, font as F } from '../theme.mjs';
import { esc, r1 as r } from '../util.mjs';

const W = 880;
const PAD = 44;
const xL = PAD;
const xR = W - PAD;

const roleFill = { ink: C.ink, accent: C.accent, muted: C.muted, dim: C.dim };

// ── small emit helpers ───────────────────────────────────────────────────────
const up = (s) => String(s).toUpperCase();

function tspans(runs) {
  return runs.map(([t, role]) => `<tspan fill="${roleFill[role] || C.ink}">${esc(t)}</tspan>`).join('');
}

function text(x, y, content, o = {}) {
  const a = [
    `x="${r(x)}"`,
    `y="${r(y)}"`,
    `font-family="${o.mono ? F.mono : F.serif}"`,
    `font-size="${o.size || 16}"`,
    o.mono ? '' : 'font-style="italic"',
    o.weight ? `font-weight="${o.weight}"` : '',
    o.fill ? `fill="${o.fill}"` : `fill="${C.ink}"`,
    o.anchor ? `text-anchor="${o.anchor}"` : '',
    o.ls != null ? `letter-spacing="${o.ls}"` : '',
  ].filter(Boolean).join(' ');
  return `<text ${a}>${content}</text>`;
}

const hline = (x1, x2, y, stroke, dash) =>
  `<line x1="${r(x1)}" y1="${r(y)}" x2="${r(x2)}" y2="${r(y)}" stroke="${stroke}" stroke-width="1"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
const vline = (x, y1, y2, stroke) =>
  `<line x1="${r(x)}" y1="${r(y1)}" x2="${r(x)}" y2="${r(y2)}" stroke="${stroke}" stroke-width="1"/>`;

// red/lime "live" dot with an expanding ring (emulates the CSS box-shadow pulse).
function pulseDot(cx, cy, fill) {
  return `
    <circle cx="${r(cx)}" cy="${r(cy)}" r="3.5" fill="${fill}"/>
    <circle cx="${r(cx)}" cy="${r(cy)}" r="3.5" fill="none" stroke="${fill}" stroke-width="1.5">
      <animate attributeName="r" values="3.5;9;9" dur="1.8s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;0;0" dur="1.8s" repeatCount="indefinite"/>
    </circle>`;
}

function wrap(str, maxChars) {
  const words = str.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) {
      lines.push(cur.trim());
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur.trim());
  return lines;
}

// Catmull-Rom → cubic bezier (ported verbatim from the handoff prototype).
function smooth(pts) {
  if (pts.length < 2) return '';
  let d = `M${r(pts[0][0])},${r(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${r(c1x)},${r(c1y)} ${r(c2x)},${r(c2y)} ${r(p2[0])},${r(p2[1])}`;
  }
  return d;
}

export function renderPage({ config: cfg, data, fontFace }) {
  const el = [];
  let y;

  // ── PATH BAR ───────────────────────────────────────────────────────────────
  el.push(text(28, 30, `<tspan fill="${C.ink}">${esc(cfg.username)}</tspan><tspan fill="${C.dim}"> / </tspan><tspan fill="${C.muted}">README.md</tspan>`, { mono: true, size: 12 }));
  const liveX = W - 232;
  el.push(pulseDot(liveX, 25, C.live));
  el.push(text(liveX + 12, 29, 'online · building', { mono: true, size: 12, fill: C.ink }));
  el.push(text(W - 28, 29, '✎', { mono: true, size: 13, fill: C.dim, anchor: 'end' }));
  el.push(hline(0, W, 48, C.line));

  // ── HERO ─────────────────────────────────────────────────────────────────
  let hy = 96; // pathbar (48) + top padding (48)

  // meta row (optional — empty array collapses the space)
  if (cfg.meta && cfg.meta.length) {
    let mx = xL;
    for (const item of cfg.meta) {
      if (item.dot) {
        el.push(`<circle cx="${r(mx + 3)}" cy="${r(hy - 4)}" r="3" fill="${C.accent}"/>`);
        mx += 14;
      }
      const pre = item.pre ? up(item.pre) : '';
      const hi = up(item.hi);
      el.push(text(mx, hy, `<tspan fill="${C.muted}">${esc(pre)}</tspan><tspan fill="${C.ink}">${esc(hi)}</tspan>`, { mono: true, size: 11, ls: 1.5 }));
      mx += (pre.length + hi.length) * 7.1 + 30;
    }
    hy += 48;
  }

  // eyebrow
  el.push(text(xL, hy, up(cfg.eyebrow), { mono: true, size: 13, fill: C.muted, ls: 1.2 }));
  hy += 136;

  // name (gradient fill + lime period)
  el.push(text(xL - 2, hy, `<tspan fill="url(#nameGrad)">${esc(cfg.name)}</tspan><tspan fill="${C.accent}">.</tspan>`, { size: 132, ls: -3 }));
  hy += 70;

  // tagline
  for (const line of cfg.tagline) {
    el.push(text(xL, hy, tspans(line), { size: 31, ls: -0.3 }));
    hy += 40;
  }

  // hero divider
  hy += 16;
  el.push(hline(xL, xR, hy, C.line));
  const heroBottom = hy;

  // ── STATS STRIP ────────────────────────────────────────────────────────────
  const sTop = heroBottom + 40;
  el.push(hline(xL, xR, sTop, C.line));
  const colW = (xR - xL) / 4;
  const stats = [
    { plus: '+', v: String(data.stats.contributions), unit: 'total', k: 'Contributions' },
    { v: String(data.stats.streak), unit: 'd', k: 'Longest Streak' },
    { v: String(data.stats.avgPerWeek), unit: '/wk', k: 'Avg Commits' },
    { v: '∞', unit: 'ideas', k: 'In The Pipeline' },
  ];
  const vBaseline = sTop + 64;
  stats.forEach((s, i) => {
    const cx = xL + i * colW + (i ? 22 : 0);
    if (i) el.push(vline(xL + i * colW, sTop + 14, sTop + 96, C.lineSoft));
    let inner = '';
    if (s.plus) inner += `<tspan font-family="${F.mono}" font-style="normal" fill="${C.accent}" font-size="22" dy="-16">${esc(s.plus)}</tspan><tspan dy="16">${esc(s.v)}</tspan>`;
    else inner += `<tspan>${esc(s.v)}</tspan>`;
    inner += `<tspan font-family="${F.mono}" font-style="normal" fill="${C.muted}" font-size="18" dx="4">${esc(s.unit)}</tspan>`;
    el.push(text(cx, vBaseline, inner, { size: 50, ls: -1 }));
    el.push(text(cx, sTop + 116, up(s.k), { mono: true, size: 10, fill: C.muted, ls: 1.4 }));
  });
  const sBottom = sTop + 134;
  el.push(hline(xL, xR, sBottom, C.line));

  // ── ABOUT (§01) ──────────────────────────────────────────────────────────
  let secTop = sBottom + 56;
  el.push(hline(xL, xR, secTop, C.line));
  el.push(text(xL, secTop + 30, `<tspan fill="${C.accent}">§</tspan><tspan fill="${C.ink}">  ${esc(up('About'))}</tspan>`, { mono: true, size: 11, weight: 500, ls: 1.6 }));
  el.push(text(xR, secTop + 29, '01', { mono: true, size: 10, fill: C.dim, anchor: 'end', ls: 1.2 }));
  y = secTop + 88;
  for (const line of cfg.manifesto) {
    el.push(text(xL, y, tspans(line), { size: 38, ls: -0.4 }));
    y += 44;
  }
  y += 6;
  for (const ln of wrap(cfg.manifestoSub, 92)) {
    el.push(text(xL, y, esc(ln), { mono: true, size: 12, fill: C.muted, ls: 0.2 }));
    y += 22;
  }

  // ── ACTIVITY (§02) the centerpiece ───────────────────────────────────────
  const aTop = y + 40;
  el.push(hline(xL, xR, aTop, C.line));
  el.push(text(xL, aTop + 34, `<tspan fill="${C.accent}">§</tspan><tspan fill="${C.ink}">  ${esc(up('Activity'))}</tspan>`, { mono: true, size: 11, weight: 500, ls: 1.6 }));
  el.push(text(xR, aTop + 33, up('02 · last 26 weeks'), { mono: true, size: 10, fill: C.dim, anchor: 'end', ls: 1.2 }));

  // headline + subhead
  el.push(text(xL, aTop + 96, 'on a <tspan>tear</tspan>.', { size: 46, ls: -1 }));
  el.push(text(xL, aTop + 124, up(`${data.stats.recentTotal} contributions · trending up`), { mono: true, size: 11, fill: C.muted, ls: 1.4 }));

  // trend pill (right)
  if (data.stats.yoyPct != null) {
    const label = `${data.stats.yoyPct >= 0 ? '+' : ''}${data.stats.yoyPct}% YoY`;
    const pw = label.length * 7.0 + 40;
    const px = xR - pw;
    const py = aTop + 78;
    el.push(`<rect x="${r(px)}" y="${r(py)}" width="${r(pw)}" height="30" rx="15" fill="none" stroke="${C.accent}"/>`);
    el.push(`<path d="M${r(px + 16)} ${r(py + 20)} L${r(px + 21)} ${r(py + 10)} L${r(px + 26)} ${r(py + 20)} Z" fill="${C.accent}"/>`);
    el.push(text(px + 32, py + 20, esc(label), { mono: true, size: 11, fill: C.accent, ls: 0.6 }));
  }

  // chart geometry
  const cTop = aTop + 150;
  const cH = 250;
  const pad = { l: 38, r: 12, t: 14, b: 12 };
  const plotL = xL + pad.l;
  const plotR = xR - pad.r;
  const plotT = cTop + pad.t;
  const plotB = cTop + cH - pad.b;
  const series = data.weeks;
  const n = series.length;
  const max = Math.max(...series, 1) * 1.1;
  const xs = series.map((_, i) => plotL + (plotR - plotL) * (i / (n - 1)));
  const ys = series.map((v) => plotT + (plotB - plotT) * (1 - v / max));

  // grid + y ticks
  const ticks = 4;
  for (let i = 0; i <= ticks; i++) {
    const val = Math.round((max * i) / ticks);
    const gy = plotT + (plotB - plotT) * (1 - i / ticks);
    el.push(hline(plotL, plotR, gy, i === ticks ? C.gridEdge : C.grid, i !== ticks && i !== 0 ? '2,4' : null));
    el.push(text(plotL - 10, gy + 3, String(val), { mono: true, size: 9, fill: C.tick, anchor: 'end' }));
  }

  const pts = xs.map((x, i) => [x, ys[i]]);
  const linePath = smooth(pts);
  const areaPath = `${linePath} L${r(xs[n - 1])},${r(plotB)} L${r(xs[0])},${r(plotB)} Z`;
  el.push(`<path d="${areaPath}" fill="url(#areaGrad)"/>`);
  el.push(`<path d="${linePath}" fill="none" stroke="${C.accent}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round" opacity="0.22" filter="url(#glow)"/>`);
  el.push(`<path d="${linePath}" fill="none" stroke="${C.accent}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`);

  // peak callout (at the actual max week)
  const pi = data.stats.peakIdx;
  const px = xs[pi];
  const py = ys[pi];
  el.push(`<circle cx="${r(px)}" cy="${r(py)}" r="4" fill="${C.accent}" opacity="0.18"><animate attributeName="r" values="4;14;4" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.35;0;0.35" dur="2s" repeatCount="indefinite"/></circle>`);
  el.push(`<circle cx="${r(px)}" cy="${r(py)}" r="4" fill="${C.accent}" stroke="${C.bg}" stroke-width="2"/>`);
  // leader line up-and-left, label kept inside the plot
  const goLeft = px > plotL + 120;
  const lx = goLeft ? px - 28 : px + 28;
  const lx2 = goLeft ? px - 86 : px + 86;
  el.push(`<line x1="${r(px)}" y1="${r(py - 6)}" x2="${r(lx)}" y2="${r(py - 30)}" stroke="${C.accent}" stroke-width="1"/>`);
  el.push(`<line x1="${r(lx)}" y1="${r(py - 30)}" x2="${r(lx2)}" y2="${r(py - 30)}" stroke="${C.accent}" stroke-width="1"/>`);
  el.push(text(goLeft ? lx - 6 : lx + 6, py - 36, up(`peak · ${data.stats.peak} commits`), { mono: true, size: 10, fill: C.accent, weight: 500, anchor: goLeft ? 'end' : 'start', ls: 0.4 }));

  // x-axis months
  const months = data.months;
  const axY = cTop + cH + 20;
  months.forEach((m, i) => {
    const mxp = plotL + (plotR - plotL) * (months.length > 1 ? i / (months.length - 1) : 0);
    const anchor = i === 0 ? 'start' : i === months.length - 1 ? 'end' : 'middle';
    el.push(text(mxp, axY, up(m), { mono: true, size: 10, fill: C.muted, anchor, ls: 1.2 }));
  });

  // chart footer
  const cfY = axY + 30;
  el.push(hline(xL, xR, cfY - 14, C.lineSoft));
  el.push(text(xL, cfY, up('updated · just now'), { mono: true, size: 10, fill: C.dim, ls: 1.0 }));
  el.push(text(xR, cfY, `<tspan fill="${C.muted}">${esc(up('peak · '))}</tspan><tspan fill="${C.accent}">${esc(up('this window'))}</tspan>`, { mono: true, size: 10, anchor: 'end', ls: 1.0 }));
  const aBottom = cfY + 20;
  el.push(hline(xL, xR, aBottom, C.line));

  // ── CURRENTLY (§03) — optional (empty array hides the whole section) ───────
  let fTop = aBottom + 40;
  if (cfg.currently && cfg.currently.length) {
    secTop = aBottom + 40;
    el.push(text(xL, secTop + 18, `<tspan fill="${C.accent}">§</tspan><tspan fill="${C.ink}">  ${esc(up('Currently'))}</tspan>`, { mono: true, size: 11, weight: 500, ls: 1.6 }));
    el.push(text(xR, secTop + 17, '03', { mono: true, size: 10, fill: C.dim, anchor: 'end', ls: 1.2 }));
    let ry = secTop + 56;
    cfg.currently.forEach((row, i) => {
      if (i) el.push(hline(xL, xR, ry - 20, C.lineSoft));
      el.push(text(xL, ry, up(row.label), { mono: true, size: 11, fill: C.muted, ls: 1.2 }));
      if (row.value) {
        el.push(`<text x="${r(xL + 170)}" y="${r(ry)}" font-family="${F.mono}" font-size="14" fill="${C.ink}">${esc(row.value)}</text>`);
      } else {
        el.push(`<text x="${r(xL + 170)}" y="${r(ry)}" font-family="${F.mono}" font-size="13" fill="${C.dim}">${esc(row.placeholder)}</text>`);
      }
      el.push(text(xR, ry, up(row.when), { mono: true, size: 10, fill: C.dim, anchor: 'end', ls: 1.0 }));
      ry += 44;
    });
    fTop = ry + 4;
  }

  // ── FOOTER ─────────────────────────────────────────────────────────────────
  el.push(hline(xL, xR, fTop, C.line));
  el.push(text(xL, fTop + 26, up(cfg.footerLeft), { mono: true, size: 10, fill: C.dim, ls: 1.4 }));
  const fRightText = up('live · last seen now');
  const frX = xR - (fRightText.length * 6.6) - 16;
  el.push(pulseDot(frX, fTop + 22, C.accent));
  el.push(text(xR, fTop + 26, fRightText, { mono: true, size: 10, fill: C.ink, anchor: 'end', ls: 1.4 }));

  const H = fTop + 50;

  // ── ASSEMBLE ─────────────────────────────────────────────────────────────
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" font-family="${F.serif}">
<defs>
<style>${fontFace}
text{ -webkit-font-smoothing:antialiased; }</style>
<linearGradient id="nameGrad" x1="0" y1="0" x2="0" y2="1">
  <stop offset="55%" stop-color="${C.ink}"/><stop offset="100%" stop-color="${C.muted}"/>
</linearGradient>
<linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="${C.accent}" stop-opacity="0.30"/><stop offset="100%" stop-color="${C.accent}" stop-opacity="0"/>
</linearGradient>
<filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
</defs>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="${C.bg}" stroke="${C.line}"/>
${el.join('\n')}
</svg>`;
}
