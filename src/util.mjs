// Escape text destined for XML/SVG/HTML text nodes & attributes.
export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Round to keep generated SVG diffs small & stable.
export const r1 = (n) => Math.round(n * 10) / 10;
