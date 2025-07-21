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

const RewardDistributionChart = ({
  chartData,
  stats,
}: {
  chartData: any;
  stats: any;
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
    <section className="p-3 pt-4 rounded-lg border border-default-100 space-y-3">
      <h2 className="text-xl md:px-3 font-medium mb-4">Markets</h2>
      <ResponsiveContainer
        className="bg-default-50 rounded-md"
        height={300}
        width="100%"
      >
        <ComposedChart
          data={chartData}
          margin={{ top: 50, right: 30, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="1 5" />
          <XAxis
            dataKey="score"
            domain={[0, 1]}
            fontSize={10}
            tickCount={11}
            type="number"
          />
          <YAxis
            fontSize={10}
            domain={[0, maxUSD || 1]}
            label={{
              value: "REWARD",
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
              dataKey={p === -1 ? "negUSD" : p === 0 ? "neuUSD" : "posUSD"}
              fill={`url(#grad${p})`}
              name={`${POLARITY_LABEL[p]}`}
              stroke={POLARITY_COLOR[p]}
              strokeWidth={1}
              type="step"
              fontSize={10}
            />
          ))}

          {/* Scatter plot for each group (user points) */}
          {/* {POLARITY_VALUES.map((p) => {
            const usdKey = p === -1 ? "negUSD" : p === 0 ? "neuUSD" : "posUSD";

            const uidKey =
              usdKey === "negUSD"
                ? "negUID"
                : usdKey === "neuUSD"
                  ? "neuUID"
                  : "posUID";

            const points = chartData
              .filter(
                (d: any) => typeof d[usdKey] === "number" && !isNaN(d[usdKey])
              )
              .map((d: any) => ({
                score: d.score,
                usd: d[usdKey],
                uid: d[uidKey],
              }));

            return (
              <Scatter
                key={`scatter-${p}`}
                data={points}
                name={`${POLARITY_LABEL[p]} Users`}
                fill={POLARITY_COLOR[p]}
                yAxisId="left"
                line={false}
                shape="circle"
                dataKey="usd"
              />
            );
          })} */}

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
            content={({ active, payload, label }) => {
              if (active && payload && payload.length > 0) {
                const { uid, score, color, value } = payload[0].payload;
                console.log(payload[0].payload);
                return (
                  <div
                    style={{
                      background: "#222",
                      color: "#fff",
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 13,
                      minWidth: 160,
                    }}
                  >
                    <div style={{ marginBottom: 4 }}>
                      <strong className="pr-2">UID:</strong>
                      <span style={{ float: "right" }}>{uid}</span>
                    </div>

                    {payload.map((entry: any, idx: number) => (
                      <>
                        <div key={idx} style={{ marginBottom: 4 }}>
                          <strong>Score:</strong>
                          <span style={{ float: "right", color: entry.color }}>
                            {score.toFixed(3)}
                          </span>
                        </div>
                        <div style={{ marginBottom: 4 }}>
                          <strong>Est. Reward:</strong>{" "}
                          <span style={{ float: "right", color: color }}>
                            {typeof entry.value === "number"
                              ? entry.value.toFixed(2)
                              : "-"}
                            %
                          </span>
                        </div>
                      </>
                    ))}
                  </div>
                );
              }
              return null;
            }}
            cursor={{ strokeDasharray: "3 3" }}
          />
          <Legend />
        </ComposedChart>
      </ResponsiveContainer>
    </section>
  );
};

export default RewardDistributionChart;
