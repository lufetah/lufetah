// Reads the vendored font subset and returns an @font-face block with the font
// inlined as a base64 data URI. This is the trick that makes Instrument Serif
// render inside an <img>-loaded SVG on GitHub: external font URLs are blocked by
// the image sandbox, but a data: URI inside the SVG's own <style> is honored.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONTS = join(__dirname, '..', 'assets', 'fonts');

export async function instrumentSerifFace() {
  let b64;
  try {
    const buf = await readFile(join(FONTS, 'InstrumentSerif-Italic.ttf'));
    b64 = buf.toString('base64');
  } catch {
    console.warn('⚠ Font not vendored — run `npm run fonts`. Falling back to Georgia.');
    return ''; // theme.serif already lists Georgia as the fallback.
  }
  return `@font-face{font-family:'Instrument Serif';font-style:italic;font-weight:400;font-display:block;src:url(data:font/ttf;base64,${b64}) format('truetype');}`;
}
