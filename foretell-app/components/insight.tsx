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
import {
  CHANGE_TYPE,
  ForetellProps,
  POLARITY_COLOR,
  POLARITY_LABEL,
  POLARITY_VALUES,
  useForetell,
} from "@/hooks/useForetell";
import { RewardTable } from "./reward-table";
import Response from "./response";

export default function Insight(props: ForetellProps) {
  const { question, totalPool, data } = props;
  const { groups, stats, processed, chartData, miniData } = useForetell(
    data,
    totalPool
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Summary */}
      <section className="md:p-6 p-3 rounded-lg bg-default-100 border border-default-100 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <p className="text-xl font-semibold leading-tight">{question}</p>
          <p className="text-sm text-default-500">Resolves in 1000 responses</p>
        </div>

        <Response />
      </section>

      {/* Summary Cards Below Chart */}
      <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {POLARITY_VALUES.map((p, index) => (
          <div
            key={p}
            className="md:p-6 p-3 flex flex-wrap justify-between rounded-lg border border-default-200"
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
                    "text-success": p === 1,
                    "text-warning": p === 0,
                    "text-danger": p === -1,
                  })}
                />
                {POLARITY_LABEL[p]}
              </dt>
              <dd className="mt-2 text-3xl font-semibold text-default-800">
                {groups[p].length}
              </dd>
            </div>
            <div className=" hidden w-3/5 shrink-0 lg:block">
              <ResponsiveContainer width="100%" height={100} debounce={200}>
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
                    type="natural"
                    dataKey="value"
                    stroke={POLARITY_COLOR[p]}
                    fill={`url(#miniGrad${index})`}
                  />
                  <Tooltip
                    cursor={false}
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;
                      // grab the dragged point
                      const { uid, polarity, value } = payload[0].payload;
                      return (
                        <div className="bg-default-100/50 backdrop-blur-md text-default-800 p-2 rounded text-xs">
                          <div>
                            <strong>UID:</strong> {uid}
                          </div>
                          <div>
                            <strong>Polarity:</strong> {polarity}
                          </div>
                          <div>
                            <strong>Intensity:</strong> {value}
                          </div>
                        </div>
                      );
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </dl>

      {/* Reward Distribution Chart */}
      <section className="md:p-6 p-3 rounded-lg border border-default-200">
        <h2 className="text-xl font-medium mb-4">Distribution</h2>
        <ResponsiveContainer
          className="bg-default-50 rounded-md"
          width="100%"
          height={300}
        >
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
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
                    stopOpacity={1}
                  />
                  <stop
                    offset="95%"
                    stopColor={POLARITY_COLOR[p]}
                    stopOpacity={0.5}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="1 5" />
            <XAxis
              dataKey="score"
              type="number"
              domain={[0, 1]}
              tickCount={11}
              fontSize={10}

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
              fontSize={10}
              label={{ value: "% Share", angle: -90, position: "outsideLeft" }}
            />
            {POLARITY_VALUES.map((p) => (
              <ReferenceLine
                key={p}
                x={stats[p].avg}
                stroke={POLARITY_COLOR[p]}
                strokeDasharray="5 2"
                // label={{ value: `${POLARITY_LABEL[p]}`, position: "top" }}
              />
            ))}
            <Tooltip
              formatter={(v: number, name: string) => [
                `${v}%`,
                name.replace(/PS/, " % Share"),
              ]}
              labelFormatter={(l) => `Score: ${l}`}
              contentStyle={{ backgroundColor: "#111", borderRadius: "8px" }}
            />
            <Legend verticalAlign="bottom" />
            {POLARITY_VALUES.map((p) => (
              <Area
                key={p}
                type="basis"
                dataKey={p === -1 ? "negPS" : p === 0 ? "neuPS" : "posPS"}
                name={`${POLARITY_LABEL[p]}`}
                stroke={POLARITY_COLOR[p]}
                fill={`url(#grad${p})`}
                strokeWidth={3}
                connectNulls
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* User Table */}
      <section className="md:p-6 p-3 rounded-lg border border-default-200 overflow-x-auto">
        <h2 className="text-xl font-medium mb-4">Responses</h2>
        <RewardTable data={processed} isLoading={false} />
      </section>
    </div>
  );
}
