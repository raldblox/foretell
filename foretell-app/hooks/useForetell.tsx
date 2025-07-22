import { useMemo } from "react";

// --- Types & Interfaces ---
export type Polarity = -1 | 0 | 1;
export type Resolution = "time" | "quantity";
export interface RawEntry {
  uid: string;
  polarity: Polarity;
  score: number;
  intensity?: number;
  answer?: string;
  createdAt?: string; // ISO string, server-side timestamp
}

export interface Reward {
  chainId: string;
  nativeToken: boolean;
  rewardPool: number;
  tokenAddress: string;
}
export interface Survey {
  surveyId: string;
  title: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  expiry?: string;
  maxResponses?: number;
  responses?: RawEntry[];
  rewardPool?: Reward;
  allowAnonymity?: boolean;
  discoverable?: boolean;
}
export interface SurveyProps {
  question: string;
  rewardPool?: Reward;
  surveyData: RawEntry[];
  isLoading?: boolean;
  visibility?: boolean;
  allowAnonymity?: boolean;
  resolution?: Resolution;
  expiry?: number;
  idx?: number;
}

export interface WeightedEntry extends RawEntry {
  rawWeight: number;
}

export interface ProcessedEntry extends WeightedEntry {
  shareInGroup: number;
  rewardUSD: number;
  pctShare: number;
}

export interface CombinedPoint {
  score: number;
  negPS?: number;
  neuPS?: number;
  posPS?: number;
}

// --- Constants ---
export const POLARITY_VALUES: Polarity[] = [-1, 0, 1];
export const POLARITY_LABEL: Record<Polarity, string> = {
  [-1]: "Negative",
  0: "Neutral",
  1: "Positive",
};
export const POLARITY_COLOR: Record<Polarity, string> = {
  [-1]: "#ff4d4f",
  0: "#faad14",
  1: "#52c41a",
};
export const MIN_WEIGHT = 0.05;
export const CHANGE_TYPE: Record<
  Polarity,
  "negative" | "neutral" | "positive"
> = {
  [-1]: "negative",
  0: "neutral",
  1: "positive",
};

export function useForetell(surveyData: RawEntry[], pool?: Reward) {
  const totalPool = pool?.rewardPool ? pool.rewardPool : 100;

  // 1) group
  const groups = useMemo(
    () =>
      POLARITY_VALUES.reduce(
        (acc, p) => {
          acc[p] = surveyData.filter((u) => u.polarity === p);

          return acc;
        },
        {} as Record<Polarity, RawEntry[]>
      ),
    [surveyData]
  );

  // 2) stats (now includes median)
  const stats = useMemo(
    () =>
      POLARITY_VALUES.reduce(
        (acc, p) => {
          const scores = groups[p].map((u) => u.score);
          // Calculate median
          const sorted = [...scores].sort((a, b) => a - b);
          let median = 0;
          if (sorted.length > 0) {
            const mid = Math.floor(sorted.length / 2);
            median =
              sorted.length % 2 !== 0
                ? sorted[mid]
                : (sorted[mid - 1] + sorted[mid]) / 2;
          }
          // Max possible distance from median in this group
          const maxDist =
            sorted.length > 0
              ? Math.max(...sorted.map((x) => Math.abs(x - median)))
              : 0;
          acc[p] = { median, maxDist };
          return acc;
        },
        {} as Record<Polarity, { median: number; maxDist: number }>
      ),
    [groups]
  );

  // 3) weighted (closeness to median, no zero rewards)
  const weighted: WeightedEntry[] = useMemo(
    () =>
      surveyData.map((u) => {
        const { median, maxDist } = stats[u.polarity];
        // Closeness to median (1 if at median, 0 if farthest in group)
        let closeness = 1;
        if (maxDist > 0) {
          closeness = 1 - Math.abs(u.score - median) / maxDist;
        }
        // Ensure no one gets zero: add MIN_WEIGHT
        return { ...u, rawWeight: closeness + MIN_WEIGHT };
      }),
    [surveyData, stats]
  );

  // 4) process (normalize within group, calculate rewards)
  const processed: ProcessedEntry[] = useMemo(
    () =>
      weighted.map((u) => {
        // Sum of weights in this group
        const groupWeights = weighted.filter((x) => x.polarity === u.polarity);
        const groupSum = groupWeights.reduce((s, x) => s + x.rawWeight, 0);
        const shareInGroup = u.rawWeight / groupSum;
        // Group reward pool
        const groupSize = groups[u.polarity].length;
        const groupReward = (groupSize / surveyData.length) * totalPool;
        const rewardUSD = parseFloat((shareInGroup * groupReward).toFixed(2));
        const pctShare = parseFloat(((rewardUSD / totalPool) * 100).toFixed(2));
        return { ...u, shareInGroup, rewardUSD, pctShare };
      }),
    [weighted, groups, surveyData.length, totalPool]
  );

  // 5) combined chart surveyData (per-group score and usdReward for chart)
  const chartData = useMemo(() => {
    // Collect all unique scores from all processed entries
    const allScores = Array.from(new Set(processed.map((u) => u.score))).sort(
      (a, b) => a - b
    );
    // For each score, build a data point with per-group values
    return allScores.map((score) => {
      const point: any = { score };
      POLARITY_VALUES.forEach((p) => {
        const entry = processed.find(
          (u) => u.polarity === p && u.score === score
        );
        if (entry) {
          if (p === -1) {
            point.score = entry.score;
            point.negReward = entry.rewardUSD;
            point.uid = entry.uid;
          } else if (p === 0) {
            point.score = entry.score;
            point.neuReward = entry.rewardUSD;
            point.uid = entry.uid;
          } else if (p === 1) {
            point.score = entry.score;
            point.posReward = entry.rewardUSD;
            point.uid = entry.uid;
          }
        }
      });
      return point;
    });
  }, [processed]);

  // 6) mini spark surveyData
  const miniData: Record<
    Polarity,
    { uid: string; polarity: Polarity; score: number; value: number }[]
  > = POLARITY_VALUES.reduce((acc, p) => {
    let group = groups[p].map((u) => processed.find((x) => x.uid === u.uid)!);

    acc[p] = group
      .map((u) => {
        let intensity =
          typeof u.intensity === "number"
            ? u.intensity
            : (() => {
                if (u.polarity === -1) {
                  return 1 - Math.min(Math.max(u.score / 0.3, 0), 1);
                } else if (u.polarity === 0) {
                  return 1 - Math.min(Math.abs(u.score - 0.5) / 0.2, 1);
                } else if (u.polarity === 1) {
                  return Math.min(Math.max((u.score - 0.7) / 0.3, 0), 1);
                }

                return 0;
              })();

        return {
          uid: u.uid,
          polarity: u.polarity,
          score: u.score,
          intensity,
          value: intensity,
        };
      })
      .sort((a, b) => a.value - b.value);

    return acc;
  }, {} as any);

  return { groups, stats, processed, chartData, miniData };
}
