"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

// Polarity type and array of valid values
type Polarity = -1 | 0 | 1;
const POLARITY_VALUES: Polarity[] = [-1, 0, 1];

// Raw user response
interface UserRaw {
  uid: string;
  polarity: Polarity;
  score: number;
  answer: string;
}

// Weighted user with raw weight
interface UserWeighted extends UserRaw {
  rawWeight: number;
}

// Final processed user data
interface UserProcessed extends UserWeighted {
  shareInGroup: number;
  rewardUSD: number;
  pctShare: number;
}

// Data point for combined chart curves
interface CombinedPoint {
  score: number;
  negPS?: number;
  neuPS?: number;
  posPS?: number;
}

// Survey question
const question = "What do you think about the new UI redesign?";

// Sample dataset
const rawData: UserRaw[] = [
  { uid: "U1",  polarity:  1, score: 0.9, answer: "Absolutely love it—clean, intuitive, and modern!" },
  { uid: "U2",  polarity:  1, score: 0.88, answer: "The redesign is fantastic, much easier to navigate." },
  { uid: "U3",  polarity:  1, score: 0.85, answer: "Really impressed with the new look and feel." },
  { uid: "U4",  polarity:  1, score: 0.82, answer: "Sleek and fast — great job!" },
  { uid: "U5",  polarity:  1, score: 0.80, answer: "Very user-friendly. Love the color scheme." },
  { uid: "U6",  polarity:  1, score: 0.78, answer: "Much better than the old version, well done." },
  { uid: "U7",  polarity:  1, score: 0.75, answer: "Smooth animations and cleaner layout, great update." },
  { uid: "U8",  polarity:  1, score: 0.72, answer: "Really like the minimalistic approach." },
  { uid: "U9",  polarity:  1, score: 0.70, answer: "The new icons and spacing feel very polished." },
  { uid: "U10", polarity:  1, score: 0.68, answer: "Bright, fresh, and modern—nice work!" },

  { uid: "U11", polarity:  0, score: 0.60, answer: "It’s okay. Some things improved, some are the same." },
  { uid: "U12", polarity:  0, score: 0.58, answer: "Neutral—I don’t hate it but don’t love it either." },
  { uid: "U13", polarity:  0, score: 0.55, answer: "It works fine, nothing groundbreaking." },
  { uid: "U14", polarity:  0, score: 0.53, answer: "Some parts feel clunky, but overall acceptable." },
  { uid: "U15", polarity:  0, score: 0.50, answer: "Middling – I might prefer the old toolbars." },
  { uid: "U16", polarity:  0, score: 0.48, answer: "I’m indifferent, don’t notice a big difference." },
  { uid: "U17", polarity:  0, score: 0.45, answer: "Slightly confusing at first but okay." },
  { uid: "U18", polarity:  0, score: 0.42, answer: "Neutral—just another UI update." },
  { uid: "U19", polarity:  0, score: 0.40, answer: "Fine, but icons could be clearer." },
  { uid: "U20", polarity:  0, score: 0.38, answer: "I neither love nor hate this design." },

  { uid: "U21", polarity: -1, score: 0.35, answer: "Not a fan—buttons are too small." },
  { uid: "U22", polarity: -1, score: 0.33, answer: "I find it confusing and cluttered." },
  { uid: "U23", polarity: -1, score: 0.30, answer: "It’s slower and uglier than before." },
  { uid: "U24", polarity: -1, score: 0.28, answer: "Dislike the color choices—they hurt my eyes." },
  { uid: "U25", polarity: -1, score: 0.25, answer: "The redesign feels unfinished and buggy." },
  { uid: "U26", polarity: -1, score: 0.22, answer: "Hard to find things now—very frustrating." },
  { uid: "U27", polarity: -1, score: 0.20, answer: "I prefer the old layout—it was simpler." },
  { uid: "U28", polarity: -1, score: 0.18, answer: "Terrible UX—will switch back if possible." },
  { uid: "U29", polarity: -1, score: 0.15, answer: "This is a step backward, honestly." },
  { uid: "U30", polarity: -1, score: 0.12, answer: "Worst update in years, please revert." },
];

const TOTAL_POOL = 100;

// 1) Group by polarity
const groups: Record<Polarity, UserRaw[]> = POLARITY_VALUES.reduce(
  (acc, p) => {
    acc[p] = rawData.filter((u) => u.polarity === p);
    return acc;
  },
  {} as Record<Polarity, UserRaw[]>
);

// 2) Allocate pool per polarity
const groupPools: Record<Polarity, number> = POLARITY_VALUES.reduce(
  (acc, p) => {
    acc[p] = (groups[p].length / rawData.length) * TOTAL_POOL;
    return acc;
  },
  {} as Record<Polarity, number>
);

// 3) Compute stats (avg and max difference) per group
const stats: Record<Polarity, { avg: number; maxDiff: number }> =
  POLARITY_VALUES.reduce(
    (acc, p) => {
      const scores = groups[p].map((u) => u.score);
      const avg = scores.reduce((s, x) => s + x, 0) / scores.length;
      const maxDiff = Math.max(...scores.map((x) => Math.abs(x - avg)));
      acc[p] = { avg, maxDiff };
      return acc;
    },
    {} as Record<Polarity, { avg: number; maxDiff: number }>
  );

// 4) Compute raw weight by closeness and floor
const MIN_WEIGHT = 0.05;
const weighted: UserWeighted[] = rawData.map((u) => {
  const { avg, maxDiff } = stats[u.polarity];
  const closeness = maxDiff ? 1 - Math.abs(u.score - avg) / maxDiff : 1;
  return { ...u, rawWeight: closeness + MIN_WEIGHT };
});

// 5) Normalize and compute rewards
const processed: UserProcessed[] = weighted.map((u) => {
  const groupSum = weighted
    .filter((x) => x.polarity === u.polarity)
    .reduce((s, x) => s + x.rawWeight, 0);
  const shareInGroup = u.rawWeight / groupSum;
  const rewardUSD = +(shareInGroup * groupPools[u.polarity]).toFixed(2);
  const pctShare = +((rewardUSD / TOTAL_POOL) * 100).toFixed(1);
  return { ...u, shareInGroup, rewardUSD, pctShare };
});

// 6) Build combined chart data with endpoints
const sortedPoints: CombinedPoint[] = processed
  .sort((a, b) => a.score - b.score)
  .map((u) => ({
    score: u.score,
    negPS: u.polarity === -1 ? u.pctShare : undefined,
    neuPS: u.polarity === 0 ? u.pctShare : undefined,
    posPS: u.polarity === 1 ? u.pctShare : undefined,
  }));
const chartData: CombinedPoint[] = [
  { score: 0, negPS: 0, neuPS: 0, posPS: 0 },
  ...sortedPoints,
  { score: 1, negPS: 0, neuPS: 0, posPS: 0 },
];

export default function SentimentDashboard() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-semibold">{question}</h1>

      {/* Combined Chart */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-medium mb-4">
          Combined Sentiment Distribution
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{ top: 0, right: 50, left: 20, bottom: 20 }}
          >
            {/* <defs>
              <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff4d4f" stopOpacity={0} />
                <stop offset="95%" stopColor="#ff4d4f" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="neuGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#faad14" stopOpacity={0} />
                <stop offset="95%" stopColor="#faad14" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#52c41a" stopOpacity={0} />
                <stop offset="95%" stopColor="#52c41a" stopOpacity={1} />
              </linearGradient>
            </defs> */}
            <CartesianGrid strokeDasharray="2 2" />
            <XAxis
              dataKey="score"
              type="number"
              domain={[0, 1]}
              tickCount={4}
              //   label={{
              //     value: "Score (0–1)",
              //     position: "insideBottom",
              //     offset: 10,
              //   }}
            />
            <YAxis
              domain={[
                0,
                Math.ceil(Math.max(...processed.map((u) => u.pctShare))),
              ]}
              label={{ value: "% Share", angle: -90, position: "insideLeft" }}
            />
            {POLARITY_VALUES.map((p) => (
              <ReferenceLine
                key={p}
                x={stats[p].avg}
                stroke={p === -1 ? "#ff4d4f" : p === 0 ? "#faad14" : "#52c41a"}
                strokeDasharray="3 3"
                // label={{
                //   value: p === -1 ? "Neg Avg" : p === 0 ? "Neu Avg" : "Pos Avg",
                //   position: "top",
                // }}
              />
            ))}
            <Tooltip
              formatter={(v: number, name: string) => [
                `${v}%`,
                name.replace(/PS/, " % Share"),
              ]}
              labelFormatter={(l) => `Score: ${l}`}
            />
            <Legend verticalAlign="bottom" />
            <Area
              type="basis"
              dataKey="negPS"
              name="Negative"
              stroke="#ff4d4f"
              fill="url(#negGrad)"
              strokeWidth={3}
              connectNulls
            />
            <Area
              type="basis"
              dataKey="neuPS"
              name="Neutral"
              stroke="#faad14"
              fill="url(#neuGrad)"
              strokeWidth={3}
              connectNulls
            />
            <Area
              type="basis"
              dataKey="posPS"
              name="Positive"
              stroke="#52c41a"
              fill="url(#posGrad)"
              strokeWidth={3}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* Infographics */}
      <section className="grid grid-cols-3 gap-4">
        {POLARITY_VALUES.map((p) => (
          <div key={p} className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-sm text-gray-500">
              {p === -1 ? "Negative" : p === 0 ? "Neutral" : "Positive"} Pool
            </p>
            <p className="text-2xl font-bold text-gray-800">
              ${groupPools[p].toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">{groups[p].length} users</p>
            <p className="text-sm text-gray-600">
              Avg Score {stats[p].avg.toFixed(2)}
            </p>
          </div>
        ))}
      </section>

      {/* Table */}
      <section className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <h2 className="text-xl font-medium mb-4">User Responses & Rewards</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "UID",
                "Answer",
                "Polarity",
                "Score",
                "% Share",
                "Reward (USD)",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processed.map((u) => (
              <tr key={u.uid} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {u.uid}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {u.answer}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {u.polarity}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {u.score.toFixed(2)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {u.pctShare.toFixed(1)}%
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  ${u.rewardUSD.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
