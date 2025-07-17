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
import { Skeleton, Spinner } from "@heroui/react";

import { RewardTable } from "./reward-table";
import Response from "./response";
import DecryptedText from "./DecryptedText/DecryptedText";

import {
  CHANGE_TYPE,
  ForetellProps,
  POLARITY_COLOR,
  POLARITY_LABEL,
  POLARITY_VALUES,
  useForetell,
} from "@/hooks/useForetell";

export default function Insight(props: ForetellProps) {
  const { question, totalPool, data, isLoading } = props;
  const { groups, stats, processed, chartData, miniData } = useForetell(
    data,
    totalPool
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Summary */}
      <section className="md:p-6 p-3 rounded-lg bg-default-100 border border-default-100 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
          <p className="text-2xl font-semibold leading-tight">
            {isLoading ? (
              <Skeleton className="w-2/5 rounded-lg">
                <div className="h-6 w-1/3 rounded-lg bg-default-200" />
              </Skeleton>
            ) : (
              <DecryptedText
                useOriginalCharsOnly
                animateOn="view"
                text={question}
              />
            )}
          </p>

          {isLoading ? (
            <Skeleton className="w-2/5 rounded-lg">
              <div className="h-6 w-1/3 rounded-lg bg-default-200" />
            </Skeleton>
          ) : (
            <p className="text-sm text-default-500">
              Resolves in 1000 responses
            </p>
          )}
        </div>

        <Response />
      </section>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {/* Summary Cards Below Chart */}
          <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {POLARITY_VALUES.map((p, index) => (
              <div
                key={p}
                className="md:p-6 p-3 flex flex-wrap justify-between rounded-lg border border-default-200"
              >
                <div>
                  <dt className="text-3xl font-medium text-default-800 flex items-center">
                    {groups[p].length}
                    <Icon
                      className={cn("ml-3", {
                        "text-success": p === 1,
                        "text-warning": p === 0,
                        "text-danger": p === -1,
                      })}
                      icon={
                        CHANGE_TYPE[p] === "positive"
                          ? "ix:emote-happy-filled"
                          : CHANGE_TYPE[p] === "negative"
                            ? "ix:emote-sad-filled"
                            : "ix:emote-neutral-filled"
                      }
                      width={30}
                    />
                    {/* {POLARITY_LABEL[p]} */}
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-default-500">
                    {POLARITY_LABEL[p]}
                  </dd>
                </div>
                <div className=" hidden w-3/5 shrink-0 lg:block">
                  <ResponsiveContainer debounce={200} height={100} width="100%">
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
                          Math.ceil(
                            Math.max(...miniData[p].map((d) => d.value))
                          ),
                        ]}
                      />
                      <MiniArea
                        dataKey="value"
                        fill={`url(#miniGrad${index})`}
                        stroke={POLARITY_COLOR[p]}
                        type="natural"
                      />
                      <Tooltip
                        content={({ payload }) => {
                          if (!payload || !payload.length) return null;
                          // grab the dragged point

                          const { uid, polarity, value, intensity, score } =
                            payload[0].payload;

                          return (
                            <div className="bg-default-100/50 backdrop-blur-md text-default-800 p-2 rounded text-xs">
                              <div>
                                <strong>UID:</strong> {uid}
                              </div>
                              <div>
                                <strong>Polarity:</strong> {polarity}
                              </div>
                              <div>
                                <strong>Intensity:</strong>{" "}
                                {typeof intensity === "number"
                                  ? intensity.toFixed(4)
                                  : value?.toFixed(4)}
                              </div>
                              <div>
                                <strong>Score:</strong>{" "}
                                {typeof score === "number"
                                  ? score.toFixed(3)
                                  : ""}
                              </div>
                            </div>
                          );
                        }}
                        cursor={false}
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
              height={300}
              width="100%"
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
                      x2="0"
                      y1="0"
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
                  domain={[0, 1]}
                  fontSize={10}
                  tickCount={11}
                  type="number"

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
                  label={{
                    value: "% Share",
                    angle: -90,
                    position: "outsideLeft",
                  }}
                />
                {POLARITY_VALUES.map((p) => (
                  <ReferenceLine
                    key={p}
                    stroke={POLARITY_COLOR[p]}
                    strokeDasharray="5 2"
                    x={stats[p].avg}
                    // label={{ value: `${POLARITY_LABEL[p]}`, position: "top" }}
                  />
                ))}
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    borderRadius: "8px",
                  }}
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
                    connectNulls
                    dataKey={p === -1 ? "negPS" : p === 0 ? "neuPS" : "posPS"}
                    fill={`url(#grad${p})`}
                    name={`${POLARITY_LABEL[p]}`}
                    stroke={POLARITY_COLOR[p]}
                    strokeWidth={3}
                    type="basis"
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
        </>
      )}
    </div>
  );
}
