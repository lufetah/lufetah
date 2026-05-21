// Orchestrator: pull data → render SVGs → write README.md.
// Run locally with `npm run build` (uses placeholder data without a token;
// export GITHUB_TOKEN=$(gh auth token) for real numbers). The Action runs this
// with the built-in token and commits the regenerated assets.
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { config } from '../src/config.mjs';
import { getProfileData } from '../src/github.mjs';
import { instrumentSerifFace } from '../src/fonts.mjs';
import { renderPage } from '../src/svg/page.mjs';
import { renderBadge } from '../src/svg/badges.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ASSETS = join(ROOT, 'assets');

function readme(cfg, data) {
  const badges = cfg.connect
    .map((c) => {
      const img = `<img src="assets/connect-${c.name}.svg" height="38" alt="${c.name}" />`;
      const node = c.href ? `<a href="${c.href}">${img}</a>` : img;
      return `  ${node}`;
    })
    .join('\n  &nbsp;\n');

  const stamp = new Date(data.generatedAt).toISOString().slice(0, 10);
  const note =
    data.source === 'live'
      ? `↻ auto-updated daily from real GitHub activity · last refresh ${stamp}`
      : `↻ preview build (placeholder data) · set GITHUB_TOKEN for live stats`;

  return `<!-- ⚠ GENERATED FILE — do not edit by hand. Change src/config.mjs and run \`npm run build\` (or just push; the Action rebuilds). -->

<div align="center">

<a href="https://github.com/${cfg.username}"><img src="assets/profile.svg" width="880" alt="${cfg.username} — README" /></a>

### Connect

<p>
${badges}
</p>

<sub>${note}</sub>

</div>
`;
}

async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
  const data = await getProfileData({ username: config.username, token });
  console.log(`Data source: ${data.source} · shipped=${data.stats.shipped} streak=${data.stats.streak} recent=${data.stats.recentTotal} peak=${data.stats.peak} yoy=${data.stats.yoyPct}`);

  const fontFace = await instrumentSerifFace();

  await mkdir(ASSETS, { recursive: true });
  const page = renderPage({ config, data, fontFace });
  await writeFile(join(ASSETS, 'profile.svg'), page, 'utf8');
  console.log(`✓ assets/profile.svg — ${(Buffer.byteLength(page) / 1024).toFixed(0)} KB`);

  for (const c of config.connect) {
    const svg = renderBadge(c);
    await writeFile(join(ASSETS, `connect-${c.name}.svg`), svg, 'utf8');
  }
  console.log(`✓ ${config.connect.length} connect badges`);

  await writeFile(join(ROOT, 'README.md'), readme(config, data), 'utf8');
  console.log('✓ README.md');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
