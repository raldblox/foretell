"use client";

import React, { useContext, useEffect, useState } from "react";
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
import { Chip, Snippet, Button, Image } from "@heroui/react";
import QRCode from "qrcode";
import { signIn } from "next-auth/react";

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
import { AppContext } from "@/app/providers";

export default function GetInsight(survey: Survey) {
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

  const { userId } = useContext(AppContext);
  const [codeString, setCodeString] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  const { groups, stats, processed, chartData, miniData } = useForetell(
    responses || [],
    rewardPool,
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}${window.location.pathname}?surveyId=${surveyId}`;

      setCodeString(url);
      QRCode.toDataURL(
        url,
        { width: 200, margin: 2 },
        (error: Error | null | undefined, url: string) => {
          if (!error && url) setQrCodeUrl(url);
        },
      );
    }
  }, [surveyId]);

  return (
    <div className="max-w-7xl mx-auto space-y-3">
      {/* Top Summary */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-3 min-h-[300px]">
        {/* Response Container */}
        <div className="col-span-1 md:col-span-3 flex flex-col gap-3 rounded-lg border border-default-100 p-3">
          <div className="bg-default-50 flex flex-col p-3 rounded-lg gap-3">
            <p className="text-xl md:text-2xl font-semibold leading-tight md:py-0">
              {title && (
                <DecryptedText
                  useOriginalCharsOnly
                  animateOn="view"
                  text={title}
                />
              )}
            </p>
            {description && (
              <p className="text-sm text-default-500">{description}</p>
            )}
          </div>

          <SubmitResponse />
        </div>

        {/* QR/Link Container */}
        <div className="col-span-1 flex flex-col rounded-lg border border-default-100 min-h-[200px]">
          <div className="flex  gap-3 flex-col p-3 w-full items-center h-full">
            <Snippet
              hideSymbol
              className="pl-4 w-full rounded-lg bg-default-50"
              codeString={codeString}
              radius="sm"
              size="sm"
            >
              Survey Link
            </Snippet>

            <div className="flex py-6 md:aspect-square bg-default-50 rounded-lg flex-col items-center justify-center w-full">
              <span className="text-xs text-default-500 mt-1">
                Scan to open survey
              </span>

              {qrCodeUrl && codeString && (
                <Image
                  alt="Survey QR Code"
                  className="w-30 bg-default-50 p-2 rounded-md border border-default-100"
                  src={qrCodeUrl}
                />
              )}
              <div className="flex items-center flex-col text-xs justify-center">
                <span className="font-semibold">Survey ID:</span>
                <span>{surveyId}</span>
              </div>
            </div>

            <div className="flex flex-wrap max-w-2xl items-start justify-start gap-2">
              <Chip
                className="text-default-500 bg-default-50"
                size="sm"
                variant="flat"
              >
                <span className="font-semibold">Resolution:</span>{" "}
                {maxResponses} responses
              </Chip>
              <Chip
                className="text-default-500 bg-default-50"
                size="sm"
                variant="flat"
              >
                <span className="font-semibold">Created By:</span> {createdBy}
              </Chip>
              {expiry && (
                <Chip
                  className="text-default-500 bg-default-50"
                  size="sm"
                  variant="flat"
                >
                  <span className="font-semibold">Expiry:</span>{" "}
                  {new Date(expiry).toLocaleString()}
                </Chip>
              )}
            </div>
          </div>
        </div>
      </section>

      <>
        {/* Reward Distribution Chart */}
        <section className="md:p-6 p-3 rounded-lg border border-default-100 space-y-3">
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
          {/* Summary Cards Below Chart */}
          <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {POLARITY_VALUES.map((p, index) => (
              <div
                key={p}
                className="md:p-6 p-3 flex flex-wrap justify-between rounded-lg border border-default-100"
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
                          Math.ceil(
                            Math.max(...miniData[p].map((d) => d.value)),
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
        </section>

        {/* Connect X Button */}
        <section className="md:p-6 p-3 rounded-lg border border-default-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl text-left font-medium">Responses</h2>
            {!userId && (
              <Button
                className="w-fit"
                color="default"
                radius="full"
                size="sm"
                variant="flat"
                onPress={() => signIn("twitter")}
              >
                Connect <Icon icon="hugeicons:new-twitter" width={16} /> to view
                responses
              </Button>
            )}
          </div>

          {userId && (
            <div className="mt-4">
              <RewardTable data={processed} isLoading={false} />
            </div>
          )}
        </section>
      </>
    </div>
  );
}
