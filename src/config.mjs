// ─────────────────────────────────────────────────────────────────────────────
//  EDIT THIS FILE to make the profile yours. Everything here is content/copy.
//  Re-run `npm run build` (or just push — the Action rebuilds) to apply.
//
//  Text with per-word color is written as "runs": arrays of [text, role] where
//  role is 'ink' (default white), 'accent' (lime), or 'muted' (grey). Lines are
//  arrays of runs so you control exactly where each line wraps.
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  username: 'lufetah',

  // Small mono row above the name. dot:true draws a leading lime dot;
  // `pre` renders grey, `hi` renders white.
  meta: [
    { dot: true, pre: '', hi: 'v1.0 · vibecoder' },
    { pre: 'est. ', hi: 'somewhere' },
    { pre: 'status · ', hi: 'shipping' },
  ],

  eyebrow: '// hello world, my name is —',
  name: 'lufetah', // the big italic serif name; a lime "." is appended automatically

  // Tagline — one array per rendered line.
  tagline: [
    [['I build with ', 'ink'], ['AI', 'accent'], ['. I ship ', 'ink'], ['daily', 'accent'], ['.', 'ink']],
    [['The stack changes every other', 'muted']],
    [['week — the output is what sticks.', 'muted']],
  ],

  // §01 About
  manifesto: [
    [['Building ', 'ink'], ['small,', 'accent'], [' ', 'ink'], ['strange,', 'accent']],
    [['', 'ink'], ['useful', 'accent'], [' things ', 'ink'], ['— mostly', 'muted']],
    [['with AI in the loop.', 'muted']],
  ],
  manifestoSub:
    'AI-native. Prompts, agents, and whatever glue gets the thing out the door. Moving on ideas that would’ve taken a team a year.',

  // §03 Currently — fill the values in. Leave a value '' to show the placeholder.
  currently: [
    { label: 'Working on', value: '', placeholder: '// your current project', when: 'today' },
    { label: 'Exploring', value: '', placeholder: '// a rabbit hole', when: 'this week' },
    { label: 'Open to', value: '', placeholder: '// collabs, intros, chaos', when: 'always' },
    { label: 'Fun fact', value: '', placeholder: '// something true and slightly odd', when: 'irl' },
  ],

  // §04 Connect — rendered as clickable badges under the SVG. href:null => "// soon".
  connect: [
    { name: 'github', value: 'github.com/lufetah', href: 'https://github.com/lufetah' },
    { name: 'x', value: 'x.com/chefhateful', href: 'https://x.com/chefhateful' },
    { name: 'website', value: '// soon', href: null },
    { name: 'email', value: '// soon', href: null },
  ],

  // Footer
  footerLeft: 'still building.',
};
