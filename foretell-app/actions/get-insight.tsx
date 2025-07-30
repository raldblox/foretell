"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Tooltip,
  ResponsiveContainer,
  Area as MiniArea,
  YAxis as MiniYAxis,
} from "recharts";
import { Icon } from "@iconify/react";
import { cn } from "@heroui/theme";
import {
  Chip,
  Snippet,
  Image,
  Link,
  ScrollShadow,
  Button,
} from "@heroui/react";
import { useContext } from "react";
import { etherlinkTestnet } from "viem/chains";
import QRCode from "qrcode";

import SubmitResponse from "./submit-response";
import CreateSurveyModal from "./create-survey";

import { getBlockExplorerUrl } from "@/lib/contracts";
import { AppContext } from "@/app/providers";
import { Survey } from "@/types";
import { useForetell } from "@/hooks/useForetell";
import MessageCard from "@/components/ui/message-card";
import RewardDistributionChart from "@/components/visualize/reward-distribution-chart";
import {
  CHANGE_TYPE,
  POLARITY_COLOR,
  POLARITY_LABEL,
  POLARITY_VALUES,
} from "@/lib/constants";
import { OnchainVault } from "@/components/visualize/onchain-vault";

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

  const { setSurveys, setIdx, userId } = useContext(AppContext)!;
  const [codeString, setCodeString] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [creatingVault, setCreatingVault] = useState(false);
  const [vaultError, setVaultError] = useState<string | null>(null);

  const { groups, stats, processed, chartData, miniData } = useForetell(
    responses || [],
    rewardPool
  );

  const handleCreateVault = async () => {
    setCreatingVault(true);
    setVaultError(null);
    try {
      const chainId = etherlinkTestnet.id; // Or dynamically get chainId if multiple chains are supported
      const vaultRes = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyId, chainId }),
      });

      if (vaultRes.ok) {
        const { vaultAddress } = await vaultRes.json();
        const updateRes = await fetch("/api/survey", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            surveyId,
            chainId,
            vaultAddress,
          }),
        });

        if (updateRes.ok) {
          // Refresh survey data in context
          const updated = await fetch("/api/survey");

          if (updated.ok) {
            const { surveys: updatedSurveys } = await updated.json();

            setSurveys(updatedSurveys);
            // Find the index of the current survey and set it
            const currentSurveyIndex = updatedSurveys.findIndex(
              (s: Survey) => s.surveyId === surveyId
            );

            if (currentSurveyIndex !== -1) {
              setIdx(currentSurveyIndex);
            }
          }
        } else {
          const errorData = await updateRes.json();

          setVaultError(
            `Failed to update survey with vault details: ${errorData.error || updateRes.statusText}`
          );
        }
      } else {
        const errorData = await vaultRes.json();

        setVaultError(
          `Failed to create vault: ${errorData.error || vaultRes.statusText}`
        );
      }
    } catch (err: any) {
      setVaultError(err.message || "An unexpected error occurred.");
    } finally {
      setCreatingVault(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}${window.location.pathname}?surveyId=${surveyId}`;

      setCodeString(url);
      QRCode.toDataURL(
        url,
        { width: 200, margin: 2 },
        (error: Error | null | undefined, url: string) => {
          if (!error && url) setQrCodeUrl(url);
        }
      );
    }
  }, [surveyId]);

  return (
    <div className="max-w-7xl mx-auto space-y-3">
      <section className="bg-default-50/50 p-3 rounded-xl space-y-3">
        {/* Top Summary */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-3 min-h-[300px]">
          {/* Response Container */}
          <div className="col-span-1 md:col-span-3 flex flex-col gap-3 rounded-lg border border-default-100 p-3">
            <div className="bg-default-50 flex flex-col px-4 py-4 rounded-lg gap-1">
              <motion.div
                key={title} // Trigger animation when title changes
                animate={{ opacity: 1, x: 0, height: "auto" }}
                className="overflow-hidden"
                exit={{ opacity: 0, height: "auto" }}
                initial={{ opacity: 0, x: -5, height: "auto" }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                  height: {
                    duration: 1,
                    ease: "easeInOut",
                  },
                }}
              >
                <p className="text-xl md:text-2xl font-semibold leading-tight md:py-0">
                  {title}
                </p>
              </motion.div>
              {description && (
                <motion.div
                  key={description}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  className="overflow-hidden"
                  exit={{ opacity: 0, height: "auto" }}
                  initial={{ opacity: 0, x: -2, height: "auto" }}
                  transition={{
                    duration: 0.3,
                    delay: 0.1,
                    ease: "easeInOut",
                    height: {
                      duration: 0.4,
                      ease: "easeInOut",
                    },
                  }}
                >
                  <p className="text-sm text-default-500">{description}</p>
                </motion.div>
              )}
            </div>
            <SubmitResponse />
          </div>

          {/* QR/Link Container */}
          <div className="col-span-1 flex flex-col rounded-lg border border-default-100 min-h-[200px]">
            <div className="flex  gap-3 flex-col p-3  w-full items-center h-full">
              <div className="flex py-6 space-y-3 md:aspect-square bg-default-50 rounded-lg flex-col items-center justify-center w-full">
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
                  {/* <span className="font-semibold">Survey ID:</span> */}
                  <Link
                    showAnchorIcon
                    className="text-xs"
                    href={`/${surveyId}`}
                  >
                    {surveyId}
                  </Link>
                </div>
              </div>
              <Snippet
                hideSymbol
                className="pl-4 w-full rounded-lg bg-default-50"
                codeString={codeString}
                radius="sm"
                size="sm"
              >
                Survey Link
              </Snippet>

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
                  <span className="font-semibold">Created By:</span>{" "}
                  {createdBy.slice(0, 7)}...{createdBy.slice(-5)}
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

                {vaultError && (
                  <p className="text-danger text-sm">{vaultError}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Scrollable responses list */}
        <section className="p-3 md:pt-4 rounded-lg space-y-3 border border-default-100">
          <h2 className="text-xl md:px-3 text-left font-medium">Responses</h2>
          <ScrollShadow className="max-h-[350px] overflow-y-auto rounded-lg border border-default-100 p-3 flex flex-col gap-2">
            {Array.isArray(survey.responses) && survey.responses.length > 0 ? (
              [...survey.responses]
                .slice()
                .sort((a, b) => {
                  if (a.createdAt && b.createdAt) {
                    return (
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                    );
                  } else if (a.createdAt) {
                    return -1;
                  } else if (b.createdAt) {
                    return 1;
                  } else {
                    return b.uid > a.uid ? 1 : -1;
                  }
                })
                .map((resp, i) => (
                  <MessageCard
                    key={`${resp.uid}-${i}`}
                    message={resp.answer || "No answer"}
                    polarity={resp.polarity}
                    {...(resp.createdAt && {
                      messageClassName: "flex flex-col",
                    })}
                  >
                    {resp.createdAt && (
                      <span className="text-xs text-default-400 block mb-1">
                        {new Date(resp.createdAt).toLocaleString()}
                      </span>
                    )}
                    {resp.answer || "No answer"}
                  </MessageCard>
                ))
            ) : (
              <div className="text-center text-default-400 py-6">
                No responses yet.
              </div>
            )}
          </ScrollShadow>
          <div className="p-3 rounded-lg border border-default-100">
            <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {POLARITY_VALUES.map((p, index) => (
                <div
                  key={p}
                  className="md:p-6 p-3 flex flex-wrap justify-between rounded-lg bg-default-50 "
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
                  <div className="bg-black/10 rounded-md w-3/5 shrink-0 block">
                    <ResponsiveContainer
                      debounce={200}
                      height={100}
                      width="100%"
                    >
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
          </div>
        </section>
      </section>

      <section className="bg-default-50/50 p-3 rounded-xl space-y-3">
        <RewardDistributionChart
          chartData={chartData}
          processed={processed}
          stats={stats}
        />
      </section>

      <section className="bg-default-50/50 p-3 rounded-xl space-y-3">
        {survey.vaults && survey.vaults.length > 0 ? (
          <OnchainVault vaults={survey.vaults} />
        ) : (
          <div className="w-full flex justify-center items-center rounded-lg p-6">
            <Button
              color="primary"
              isDisabled={creatingVault}
              isLoading={creatingVault}
              size="sm"
              onPress={handleCreateVault}
            >
              Create Vault
            </Button>
          </div>
        )}
      </section>

      {/* Reward Distribution Chart */}

      <section className="ads">
        <div className="w-full flex justify-center items-center rounded-lg p-6">
          <CreateSurveyModal />
        </div>
      </section>
    </div>
  );
}
