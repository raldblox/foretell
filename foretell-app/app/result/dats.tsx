const totalPool = 100;

// 15 sample users
const rawData = [
  { uid: "U1", polarity: 1, score: 0.95 },
  { uid: "U2", polarity: 1, score: 0.8 },
  { uid: "U3", polarity: 0, score: 0.5 },
  { uid: "U4", polarity: 0, score: 0.45 },
  { uid: "U5", polarity: -1, score: 0.6 },
  { uid: "U6", polarity: 1, score: 0.7 },
  { uid: "U7", polarity: -1, score: 0.4 },
  { uid: "U8", polarity: 1, score: 0.85 },
  { uid: "U9", polarity: 0, score: 0.55 },
  { uid: "U10", polarity: -1, score: 0.3 },
  { uid: "U11", polarity: 1, score: 0.9 },
  { uid: "U12", polarity: 0, score: 0.6 },
  { uid: "U13", polarity: -1, score: 0.65 },
  { uid: "U14", polarity: 1, score: 0.75 },
  { uid: "U15", polarity: 0, score: 0.4 },
];

// 1) Group the users
const groups = { "-1": [], "0": [], "1": [] };
rawData.forEach((u) => groups[u.polarity].push(u));

// 2) Compute each group’s slice of the pool:
const groupPools = {
  "-1": (groups["-1"].length / rawData.length) * totalPool, // e.g. 4/15 * 100 ≈ 26.67
  "0": (groups["0"].length / rawData.length) * totalPool, // e.g. 5/15 * 100 ≈ 33.33
  "1": (groups["1"].length / rawData.length) * totalPool, // e.g. 6/15 * 100 = 40
};

// 3) For each group, find its average & max-distance
const stats = {};
for (let p of ["-1", "0", "1"]) {
  const arr = groups[p].map((u) => u.score);
  const avg = arr.reduce((s, x) => s + x, 0) / arr.length;
  const maxDiff = Math.max(...arr.map((x) => Math.abs(x - avg)));
  stats[p] = { avg, maxDiff };
}

// 4) Build the processed array with closeness, %share (capped at 15%), and USD reward
const processed = rawData.map((u) => {
  const { avg, maxDiff } = stats[u.polarity];
  // closeness to avg in [0,1]
  const closeness = maxDiff > 0 ? 1 - Math.abs(u.score - avg) / maxDiff : 1;
  // % share capped at 15%
  const pctShare = Math.min(closeness * 15, 15);
  // USD reward from that polarity’s pool
  const rewardUSD = +((groupPools[u.polarity] * pctShare) / 100).toFixed(2);
  return { ...u, closeness, pctShare, rewardUSD };
});
