// Design tokens — locked from design/preview.html handoff.
// Single sharp accent (lime). Red is ONLY for the live-status pulse.
export const color = {
  bg: '#0a0a0a',
  ink: '#f5f5f5',
  muted: '#8a8a8a',
  dim: '#4a4a4a',
  line: '#1c1c1c',
  lineSoft: '#141414',
  accent: '#c6f432',
  accentDeep: '#9ac422',
  live: '#ff3d3d',
  // chart internals
  grid: '#161616',
  gridEdge: '#2a2a2a',
  tick: '#6a6a6a',
};

// Serif is the showpiece font (embedded as a subset). Mono falls back to the
// viewer's system monospace — renders crisp via GitHub's image proxy with zero payload.
export const font = {
  serif: `'Instrument Serif', Georgia, 'Times New Roman', serif`,
  mono: `ui-monospace, 'SFMono-Regular', 'JetBrains Mono', Menlo, Consolas, monospace`,
};
