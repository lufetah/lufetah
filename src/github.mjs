// Pulls real activity from the GitHub GraphQL API and derives the numbers the
// design needs. Public data only, so the default Actions GITHUB_TOKEN works
// (we query `user(login:...)`, not `viewer`). With no token it returns clearly
// labelled synthetic data so local builds still render.

const DAY = 86400_000;
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const iso = (d) => new Date(d).toISOString();

async function gql(query, variables, token) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'lufetah-profile-generator',
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(`GraphQL: ${JSON.stringify(json.errors)}`);
  return json.data;
}

const QUERY = `
query($login:String!, $yearFrom:DateTime!, $now:DateTime!, $priorFrom:DateTime!, $priorTo:DateTime!) {
  user(login:$login) {
    repositories(privacy:PUBLIC, ownerAffiliations:OWNER) { totalCount }
    year: contributionsCollection(from:$yearFrom, to:$now) {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
    prior: contributionsCollection(from:$priorFrom, to:$priorTo) {
      contributionCalendar { totalContributions }
    }
  }
}`;

// Longest run of consecutive days with > 0 contributions, up to today.
function longestStreak(days) {
  let best = 0;
  let run = 0;
  for (const d of days) {
    if (d.contributionCount > 0) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }
  return best;
}

// Even month labels across the charted window (matches the handoff's spacing).
function monthLabels(weeks) {
  const seen = [];
  for (const w of weeks) {
    const m = MONTHS[new Date(w.date).getUTCMonth()];
    if (seen[seen.length - 1] !== m) seen.push(m);
  }
  return seen;
}

function deriveFromWeeks(weeklyTotals, weekStarts, repoCount, yearTotal, priorTotal, dailyDays) {
  const N = 26;
  const wk = weeklyTotals.slice(-N);
  const starts = weekStarts.slice(-N);
  const recentTotal = wk.reduce((a, b) => a + b, 0);
  const peakIdx = wk.reduce((bi, v, i, a) => (v > a[bi] ? i : bi), 0);
  const yoy = priorTotal > 0 ? Math.round(((recentTotal - priorTotal) / priorTotal) * 100) : null;

  return {
    stats: {
      contributions: yearTotal,
      shipped: repoCount,
      streak: longestStreak(dailyDays),
      avgPerWeek: Math.round(yearTotal / 52),
      recentTotal,
      yoyPct: yoy,
      peak: wk[peakIdx],
      peakIdx,
    },
    weeks: wk,
    months: monthLabels(starts.map((d) => ({ date: d }))),
  };
}

export async function getProfileData({ username, token }) {
  const now = Date.now();
  if (!token) {
    console.warn('⚠ No GITHUB_TOKEN — generating PLACEHOLDER data. Set the token for live stats.');
    return { ...synthetic(), source: 'placeholder', generatedAt: new Date(now).toISOString() };
  }

  const yearFrom = now - 365 * DAY;
  const recentFrom = now - 182 * DAY;
  const priorFrom = recentFrom - 365 * DAY;
  const priorTo = now - 365 * DAY;

  const data = await gql(
    QUERY,
    { login: username, yearFrom: iso(yearFrom), now: iso(now), priorFrom: iso(priorFrom), priorTo: iso(priorTo) },
    token
  );
  const u = data.user;
  if (!u) throw new Error(`User not found: ${username}`);

  const days = u.year.contributionCalendar.weeks
    .flatMap((w) => w.contributionDays)
    .filter((d) => new Date(d.date).getTime() <= now);
  const weekly = u.year.contributionCalendar.weeks.map((w) =>
    w.contributionDays.reduce((a, d) => a + d.contributionCount, 0)
  );
  const weekStarts = u.year.contributionCalendar.weeks.map((w) => w.contributionDays[0]?.date);

  const derived = deriveFromWeeks(
    weekly,
    weekStarts,
    u.repositories.totalCount,
    u.year.contributionCalendar.totalContributions,
    u.prior.contributionCalendar.totalContributions,
    days
  );
  return { ...derived, source: 'live', generatedAt: new Date(now).toISOString() };
}

// Tasteful synthetic data — trends up, last point peaks — mirrors the prototype.
function synthetic() {
  const N = 26;
  const weeks = Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    const base = 3 + 28 * t + 7 * Math.sin(t * Math.PI * 2.8);
    return Math.max(0, Math.round(base + (Math.random() - 0.5) * 8));
  });
  weeks[N - 1] = Math.max(...weeks) + 6 + Math.round(Math.random() * 4);
  const recentTotal = weeks.reduce((a, b) => a + b, 0);
  const peakIdx = weeks.reduce((bi, v, i, a) => (v > a[bi] ? i : bi), 0);
  return {
    stats: { contributions: 1240, shipped: 247, streak: 39, avgPerWeek: 12, recentTotal, yoyPct: 312, peak: weeks[peakIdx], peakIdx },
    weeks,
    months: ['may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov'],
  };
}
