"use client";

import {
  POLARITY_COLOR,
  POLARITY_LABEL,
  POLARITY_VALUES,
} from "@/hooks/useForetell";
import React from "react";
import {
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Layer,
  Area,
  Scatter,
  ComposedChart,
} from "recharts";
import { RewardTable } from "../reward-table";

const CustomDot = (props: any) => {
  const { cx, cy, fill } = props;
  return (
    <circle cx={cx} cy={cy} r={5} fill={fill} stroke="#000" strokeWidth={1} />
  );
};

const RewardDistributionChart = ({
  chartData,
  stats,
  processed,
}: {
  chartData: any;
  stats: any;
  processed: any;
}) => {
  console.log(chartData);
  console.log(stats);
  // Calculate the maximum USD value across all groups for Y-axis domain
  const maxUSD = Math.max(
    ...chartData.flatMap((d: any) => [
      d.negUSD ?? 0,
      d.neuUSD ?? 0,
      d.posUSD ?? 0,
    ])
  );
  return (
    <>
      <section className="p-3 pt-4 rounded-lg border border-default-100 space-y-3">
        <h2 className="text-xl md:px-3 font-medium mb-4">Distribution</h2>
        <ResponsiveContainer
          className="bg-default-50 rounded-md"
          height={300}
          width="100%"
        >
          <ComposedChart
            data={chartData}
            margin={{ top: 50, right: 30, left: 10, bottom: 20 }}
          >
            <defs>
              {POLARITY_VALUES.map((p) => (
                <linearGradient
                  key={`grad-${p}`}
                  id={`grad${p}`}
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={POLARITY_COLOR[p]}
                    stopOpacity={0.7}
                  />
                  <stop
                    offset="95%"
                    stopColor={POLARITY_COLOR[p]}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="1 5" />
            <XAxis
              dataKey="score"
              domain={[0, 1]}
              fontSize={10}
              tickCount={11}
              type="number"
              label={{
                value: "Sentiment Score",
                position: "outsideLeft",
                fontSize: 12,
                dy: 15,
              }}
            />
            <YAxis
              fontSize={10}
              domain={[0, maxUSD || 1]}
              label={{
                value: "% Rewards",
                angle: -90,
                position: "outsideLeft",
                fontSize: 12,
              }}
            />

            {POLARITY_VALUES.map((p) => (
              <ReferenceLine
                key={p}
                stroke={POLARITY_COLOR[p]}
                strokeDasharray="5 2"
                x={stats[p].median}
                // label={{ value: `${POLARITY_LABEL[p]}`, position: "top" }}
              />
            ))}

            {POLARITY_VALUES.map((p) => (
              <Area
                key={p}
                connectNulls
                dataKey={
                  p === -1 ? "negReward" : p === 0 ? "neuReward" : "posReward"
                }
                fill={`url(#grad${p})`}
                name={`${POLARITY_LABEL[p]}`}
                stroke={POLARITY_COLOR[p]}
                strokeWidth={3}
                type="stepAfter"
                fontSize={10}
              />
            ))}

            {/* Scatter plot for each group (user points) */}
            {POLARITY_VALUES.map((p) => {
              const rewardKey =
                p === -1 ? "negReward" : p === 0 ? "neuReward" : "posReward";
              const points = chartData
                .filter(
                  (d: any) =>
                    typeof d[rewardKey] === "number" && !isNaN(d[rewardKey])
                )
                .map((d: any) => ({
                  score: d.score,
                  reward: d[rewardKey],
                  uid: d.uid,
                }));
              if (!points.length) return null;
              return (
                <Scatter
                  key={`scatter-${p}`}
                  data={points}
                  name={`UID`}
                  fill={POLARITY_COLOR[p]}
                  yAxisId="left"
                  line={false}
                  shape={CustomDot}
                  dataKey="reward"
                />
              );
            })}

            {POLARITY_VALUES.map((p) => {
              const median = Number(stats[p].median);
              if (median === 0 || median == null || isNaN(median)) return null;
              console.log(median, p);
              return (
                <ReferenceLine
                  key={`median-${p}`}
                  x={median}
                  stroke={POLARITY_COLOR[p]}
                  strokeWidth={1}
                  strokeDasharray="5 2"
                  label={{
                    value: "x\u0303",
                    position: "top",
                    fill: POLARITY_COLOR[p],
                    fontSize: 12,
                  }}
                />
              );
            })}

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const { uid, score } = payload[0].payload;
                  const reward = payload[0].value;
                  return (
                    <div
                      style={{
                        background: "#222",
                        color: "#fff",
                        borderRadius: 8,
                        padding: 10,
                        fontSize: 13,
                        minWidth: 160,
                        zIndex: 20,
                      }}
                    >
                      <div style={{ marginBottom: 2 }}>
                        <strong className="pr-2">UID:</strong>
                        <span style={{ float: "right" }}>{uid}</span>
                      </div>
                      <div style={{ marginBottom: 2 }}>
                        <strong>Score:</strong>
                        <span style={{ float: "right" }}>
                          {typeof score === "number" ? score.toFixed(3) : "-"}
                        </span>
                      </div>
                      <div style={{ marginBottom: 2 }}>
                        <strong>Reward:</strong>{" "}
                        <span style={{ float: "right" }}>
                          {typeof reward === "number" ? reward.toFixed(2) : "-"}
                          %
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ strokeDasharray: "3 3" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <RewardTable data={processed} isLoading={false} />
      </section>
    </>
  );
};

export default RewardDistributionChart;
