// One-time (re-runnable) vendoring of the showpiece font.
// Downloads a *subset* of Instrument Serif (italic) covering the charset below
// and writes it to assets/fonts/. The subset is tiny (only these glyphs), so it
// base64-embeds cleanly into the SVG and the GitHub Action never has to touch
// Google Fonts at build time. Re-run if you add characters not in CHARSET.
//
//   node scripts/fetch-fonts.mjs
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'assets', 'fonts');

// Superset of every glyph the design can render (incl. all digits for live stats).
const CHARSET =
  'abcdefghijklmnopqrstuvwxyz' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  '0123456789' +
  " .,:;/!?—–-’'\"+%&()·∞";

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

async function fetchSubset({ family, axis, file }) {
  const css2 = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family
  )}:${axis}&text=${encodeURIComponent(CHARSET)}`;
  const cssRes = await fetch(css2, { headers: { 'User-Agent': UA } });
  if (!cssRes.ok) throw new Error(`CSS fetch failed (${cssRes.status}) for ${family}`);
  const css = await cssRes.text();
  const m = css.match(/url\((https:\/\/[^)]+)\)/);
  if (!m) throw new Error(`No font URL in CSS for ${family}:\n${css}`);

  const fontRes = await fetch(m[1], { headers: { 'User-Agent': UA } });
  if (!fontRes.ok) throw new Error(`Font fetch failed (${fontRes.status}) for ${family}`);
  const buf = Buffer.from(await fontRes.arrayBuffer());
  if (buf.length < 1000) throw new Error(`Suspiciously small font (${buf.length}b) for ${family}`);

  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, file), buf);
  console.log(`✓ ${file} — ${(buf.length / 1024).toFixed(1)} KB (${CHARSET.length} glyphs)`);
}

await fetchSubset({
  family: 'Instrument Serif',
  axis: 'ital@1',
  file: 'InstrumentSerif-Italic.ttf',
});
console.log('Done. Fonts vendored to assets/fonts/.');
