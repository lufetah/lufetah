// Small standalone badge SVGs for the Connect section. These are referenced as
// <img> inside markdown links in the README so the links are actually clickable
// (an <a> inside an <img>-loaded SVG is not). Mono only → no embedded font.
import { color as C, font as F } from '../theme.mjs';
import { esc } from '../util.mjs';

const H = 40;
const nameW = (s) => s.length * 6.4; // mono @10
const valW = (s) => s.length * 7.0; // mono @12

export function renderBadge({ name, value, href }) {
  const label = name.toUpperCase();
  const live = !!href;
  const arrow = live ? '↗' : '·';
  const valColor = live ? C.ink : C.dim;
  const w = Math.round(14 + nameW(label) + 14 + valW(value) + 14 + 12 + 14);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" fill="none">
<rect x="0.5" y="0.5" width="${w - 1}" height="${H - 1}" rx="9" fill="#0f0f0f" stroke="${C.line}"/>
<text x="14" y="${H / 2 + 4}" font-family="${F.mono}" font-size="10" letter-spacing="1.2" fill="${C.muted}">${esc(label)}</text>
<text x="${14 + nameW(label) + 14}" y="${H / 2 + 4}" font-family="${F.mono}" font-size="12" fill="${valColor}">${esc(value)}</text>
<text x="${w - 14}" y="${H / 2 + 4}" font-family="${F.mono}" font-size="13" fill="${live ? C.accent : C.dim}" text-anchor="end">${arrow}</text>
</svg>`;
}
