"use client";

import React, { useEffect, useState } from "react";
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
import { Chip, Snippet, Button } from "@heroui/react";

import SubmitResponse from "./submit-response";

import {
  CHANGE_TYPE,
  POLARITY_COLOR,
  POLARITY_LABEL,
  POLARITY_VALUES,
  useForetell,
  Survey,
} from "@/hooks/useForetell";
import DecryptedText from "@/components/DecryptedText/DecryptedText";
import { RewardTable } from "@/components/reward-table";
import { signIn, useSession } from "next-auth/react";

export default function GetInsight(survey: Survey) {
  const { data: session } = useSession();
  const {
    title,
    rewardPool,
    responses,
    maxResponses,
    surveyId,
    createdBy,
    expiry,
    description,
  } = survey;
  const { groups, stats, processed, chartData, miniData } = useForetell(
    responses || [],
    rewardPool
  );
  const [codeString, setCodeString] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCodeString(
        `${window.location.origin}${window.location.pathname}?surveyId=${surveyId}`
      );
    }
  }, [surveyId]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Summary */}
      <section className="p-6 rounded-lg border border-default-200 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start gap-x-12 justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-lg md:text-2xl font-semibold leading-tight">
              {title && (
                <DecryptedText
                  useOriginalCharsOnly
                  animateOn="view"
                  text={title}
                />
              )}
            </p>
            <p className="text-sm text-default-500">{description}</p>
          </div>
        </div>

        <SubmitResponse />
        <div className="flex flex-col md:flex-row md:items-end justify-between w-full gap-3">
          <div className="flex flex-wrap max-w-2xl items-start justify-start gap-2">
            {survey.allowAnonymity && (
              <Chip
                className="border-1"
                color="primary"
                size="sm"
                variant="bordered"
              >
                Anonymous responses allowed
              </Chip>
            )}
            <Chip
              className="border-1 text-default-500"
              size="sm"
              variant="bordered"
            >
              <span className="font-semibold">Resolution:</span> {maxResponses}{" "}
              responses
            </Chip>
            <Chip
              className="border-1 text-default-500"
              size="sm"
              variant="bordered"
            >
              <span className="font-semibold">Created By:</span> {createdBy}
            </Chip>
            {expiry && (
              <Chip
                className="border-1 text-default-500"
                size="sm"
                variant="bordered"
              >
                <span className="font-semibold">Expiry:</span>{" "}
                {new Date(expiry).toLocaleString()}
              </Chip>
            )}
          </div>
          <Snippet
            hideSymbol
            className="pl-4 w-fit rounded-full"
            codeString={codeString}
            radius="sm"
            size="sm"
          >
            Copy Survey Link
          </Snippet>
        </div>
      </section>

      <>
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
              margin={{ top: 30, right: 30, left: 10, bottom: 20 }}
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
                    className={cn("mr-2", {
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
                    width={24}
                  />
                  {POLARITY_LABEL[p]}
                </dt>
                <dd className="mt-2 text-3xl font-semibold text-default-800">
                  {groups[p].length}
                </dd>
              </div>
              <div className=" w-3/5 shrink-0 block">
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
                        Math.ceil(Math.max(...miniData[p].map((d) => d.value))),
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

        {/* Connect X Button */}
        <section className="md:p-6 p-3 rounded-lg border border-default-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl text-left font-medium">Responses</h2>
            {!session && (
              <Button
                className="w-fit"
                color="default"
                variant="flat"
                radius="full"
                size="sm"
                onPress={() => signIn("twitter")}
              >
                Connect <Icon icon="hugeicons:new-twitter" width={16} /> to view
                responses
              </Button>
            )}
          </div>

          {session && (
            <div className="mt-4">
              <RewardTable data={processed} isLoading={false} />
            </div>
          )}
        </section>
      </>
    </div>
  );
}
