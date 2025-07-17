import { useMemo } from "react";

// --- Types & Interfaces ---
export type Polarity = -1 | 0 | 1;
export interface UserRaw {
  uid: string;
  polarity: Polarity;
  score: number;
  intensity?: number;
  answer?: string;
}
export interface ForetellProps {
  question: string;
  totalPool: number;
  data: UserRaw[];
  isLoading?: boolean;
}

export interface UserWeighted extends UserRaw {
  rawWeight: number;
}

export interface UserProcessed extends UserWeighted {
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

export function useForetell(data: UserRaw[], totalPool: number) {
  // 1) group
  const groups = useMemo(
    () =>
      POLARITY_VALUES.reduce(
        (acc, p) => {
          acc[p] = data.filter((u) => u.polarity === p);

          return acc;
        },
        {} as Record<Polarity, UserRaw[]>,
      ),
    [data],
  );

  // 2) stats
  const stats = useMemo(
    () =>
      POLARITY_VALUES.reduce(
        (acc, p) => {
          const scores = groups[p].map((u) => u.score);
          const avg = scores.reduce((s, x) => s + x, 0) / scores.length;
          const maxDiff = Math.max(...scores.map((x) => Math.abs(x - avg)));

          acc[p] = { avg, maxDiff };

          return acc;
        },
        {} as Record<Polarity, { avg: number; maxDiff: number }>,
      ),
    [groups],
  );

  // 3) weighted
  const weighted: UserWeighted[] = useMemo(
    () =>
      data.map((u) => {
        const { avg, maxDiff } = stats[u.polarity];
        const closeness =
          maxDiff > 0 ? 1 - Math.abs(u.score - avg) / maxDiff : 1;

        return { ...u, rawWeight: closeness + MIN_WEIGHT };
      }),
    [data, stats],
  );

  // 4) process
  const processed: UserProcessed[] = useMemo(
    () =>
      weighted.map((u) => {
        const groupSum = weighted
          .filter((x) => x.polarity === u.polarity)
          .reduce((s, x) => s + x.rawWeight, 0);
        const shareInGroup = u.rawWeight / groupSum;
        const rewardUSD = parseFloat(
          (
            shareInGroup *
            ((groups[u.polarity].length / data.length) * totalPool)
          ).toFixed(2),
        );
        const pctShare = parseFloat(((rewardUSD / totalPool) * 100).toFixed(1));

        return { ...u, shareInGroup, rewardUSD, pctShare };
      }),
    [weighted, groups, data.length, totalPool],
  );

  // 5) combined chart data
  const chartData: CombinedPoint[] = useMemo(() => {
    const sorted = processed
      .sort((a, b) => a.score - b.score)
      .map((u) => ({
        score: u.score,
        negPS: u.polarity === -1 ? u.pctShare : undefined,
        neuPS: u.polarity === 0 ? u.pctShare : undefined,
        posPS: u.polarity === 1 ? u.pctShare : undefined,
      }));

    return [
      { score: 0, negPS: 0, neuPS: 0, posPS: 0 },
      ...sorted,
      { score: 1, negPS: 0, neuPS: 0, posPS: 0 },
    ];
  }, [processed]);

  // 6) mini spark data
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
