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
  Area as MiniArea,
  YAxis as MiniYAxis,
} from "recharts";
import { Icon } from "@iconify/react";
import { cn } from "@heroui/theme";

// Polarity type and array
type Polarity = -1 | 0 | 1;
const POLARITY_VALUES: Polarity[] = [-1, 0, 1];
const POLARITY_LABEL: Record<Polarity, string> = {
  [-1]: "Negative",
  0: "Neutral",
  1: "Positive",
};
const POLARITY_COLOR: Record<Polarity, string> = {
  [-1]: "#ff4d4f",
  0: "#faad14",
  1: "#52c41a",
};
const CHANGE_TYPE: Record<Polarity, "negative" | "neutral" | "positive"> = {
  [-1]: "negative",
  0: "neutral",
  1: "positive",
};

interface UserRaw {
  uid: string;
  polarity: Polarity;
  score: number;
  answer?: string;
}
interface UserWeighted extends UserRaw {
  rawWeight: number;
}
interface UserProcessed extends UserWeighted {
  shareInGroup: number;
  rewardUSD: number;
  pctShare: number;
}
interface CombinedPoint {
  score: number;
  negPS?: number;
  neuPS?: number;
  posPS?: number;
}

const question = "What do you think about the new UI redesign?";

// Sample raw data
const rawData: UserRaw[] = [
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
const TOTAL_POOL = 100;

// Group by polarity
const groups: Record<Polarity, UserRaw[]> = POLARITY_VALUES.reduce(
  (acc, p) => {
    acc[p] = rawData.filter((u) => u.polarity === p);
    return acc;
  },
  {} as Record<Polarity, UserRaw[]>
);

// Pool allocation
const groupPools: Record<Polarity, number> = POLARITY_VALUES.reduce(
  (acc, p) => {
    acc[p] = (groups[p].length / rawData.length) * TOTAL_POOL;
    return acc;
  },
  {} as Record<Polarity, number>
);

// Stats
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

// Weight computation
const MIN_WEIGHT = 0.05;
const weighted: UserWeighted[] = rawData.map((u) => {
  const { avg, maxDiff } = stats[u.polarity];
  const closeness = maxDiff ? 1 - Math.abs(u.score - avg) / maxDiff : 1;
  return { ...u, rawWeight: closeness + MIN_WEIGHT };
});

// Final processing
const processed: UserProcessed[] = weighted.map((u) => {
  const groupSum = weighted
    .filter((x) => x.polarity === u.polarity)
    .reduce((s, x) => s + x.rawWeight, 0);
  const shareInGroup = u.rawWeight / groupSum;
  const rewardUSD = +(shareInGroup * groupPools[u.polarity]).toFixed(2);
  const pctShare = +((rewardUSD / TOTAL_POOL) * 100).toFixed(1);
  return { ...u, shareInGroup, rewardUSD, pctShare };
});

// Combined chart data
const sorted = processed
  .sort((a, b) => a.score - b.score)
  .map((u) => ({
    score: u.score,
    negPS: u.polarity === -1 ? u.pctShare : undefined,
    neuPS: u.polarity === 0 ? u.pctShare : undefined,
    posPS: u.polarity === 1 ? u.pctShare : undefined,
  }));
const chartData: CombinedPoint[] = [
  { score: 0, negPS: 0, neuPS: 0, posPS: 0 },
  ...sorted,
  { score: 1, negPS: 0, neuPS: 0, posPS: 0 },
];

// Mini-chart data per polarity for summary cards
const miniData: Record<Polarity, { score: number; value: number }[]> =
  POLARITY_VALUES.reduce(
    (acc, p) => {
      acc[p] = groups[p]
        .map((u) => processed.find((x) => x.uid === u.uid)!)
        .sort((a, b) => a.score - b.score)
        .map((u) => ({ score: u.score, value: u.pctShare }));
      return acc;
    },
    {} as Record<Polarity, { score: number; value: number }[]>
  );

export default function SentimentDashboard() {
  return (
    <div className="max-w-7xl mx-auto p-3 space-y-8">
      {/* Top Summary */}
      <section className="p-6 rounded-lg border border-default-200 space-y-3">
        <h2 className="text-lg text-default-600">Question</h2>
        <p className="text-xl font-semibold mb-4">"{question}"</p>
      </section>

      {/* Combined Chart */}
      <section className=" p-6 rounded-lg border border-default-200">
        <h2 className="text-xl font-medium mb-4">
          Combined Sentiment Distribution
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
          >
            <defs>
              {POLARITY_VALUES.map((p) => (
                <linearGradient
                  key={p}
                  id={`grad${p}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={POLARITY_COLOR[p]}
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor={POLARITY_COLOR[p]}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="score"
              type="number"
              domain={[0, 1]}
              tickCount={4}
              //   label={{
              //     value: "Score (0–1)",
              //     position: "insideBottom",
              //     offset: -10,
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
                stroke={POLARITY_COLOR[p]}
                strokeDasharray="2 2"
                // label={{ value: `${POLARITY_LABEL[p]} Avg`, position: "top" }}
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
            {POLARITY_VALUES.map((p) => (
              <Area
                key={p}
                type="basis"
                dataKey={p === -1 ? "negPS" : p === 0 ? "neuPS" : "posPS"}
                name={`${POLARITY_LABEL[p]} % Share`}
                stroke={POLARITY_COLOR[p]}
                fill={`url(#grad${p})`}
                strokeWidth={3}
                connectNulls
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* Summary Cards Below Chart */}
      <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {POLARITY_VALUES.map((p, index) => (
          <div
            key={p}
            className=" p-4 flex flex-wrap justify-between rounded-lg border border-default-200"
          >
            <div>
              <dt className="text-sm font-medium text-default-500 flex items-center">
                <Icon
                  width={24}
                  icon={
                    CHANGE_TYPE[p] === "positive"
                      ? "ix:emote-happy-filled"
                      : CHANGE_TYPE[p] === "negative"
                        ? "ix:emote-sad-filled"
                        : "ix:emote-neutral-filled"
                  }
                  className={cn("mr-2", {
                    "text-green-500": p === 1,
                    "text-yellow-500": p === 0,
                    "text-red-500": p === -1,
                  })}
                />
                {POLARITY_LABEL[p]}
              </dt>
              <dd className="mt-2 text-3xl font-semibold text-default-800">
                {groups[p].length}
              </dd>
            </div>
            <div className="mt-10 hidden w-36 shrink-0 lg:block">
              <ResponsiveContainer width="100%" height={60} debounce={200}>
                <AreaChart data={miniData[p]}>
                  <defs>
                    <linearGradient id={`miniGrad${index}`} x1="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={POLARITY_COLOR[p]}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={POLARITY_COLOR[p]}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <MiniYAxis
                    hide
                    domain={[
                      0,
                      Math.ceil(Math.max(...miniData[p].map((d) => d.value))),
                    ]}
                  />
                  <MiniArea
                    type="bump"
                    dataKey="value"
                    stroke={POLARITY_COLOR[p]}
                    fill={`url(#miniGrad${index})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </dl>

      {/* User Table */}
      <section className=" p-6 rounded-lg border border-default-200 overflow-x-auto">
        <h2 className="text-xl font-medium mb-4">User Responses & Rewards</h2>
        <table className="min-w-full divide-y divide-default-200">
          <thead className="bg-default-50">
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
                  className="px-4 py-2 text-left text-xs font-medium text-default-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className=" divide-y divide-default-200">
            {processed.map((u) => (
              <tr key={u.uid} className="hover:bg-default-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-default-700">
                  {u.uid}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-default-700">
                  {u.answer}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-default-700">
                  {u.polarity}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-default-700">
                  {u.score.toFixed(2)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-default-700">
                  {u.pctShare.toFixed(1)}%
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-default-700">
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
