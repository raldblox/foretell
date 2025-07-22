import { Polarity } from "@/types";

// --- Constants ---
export const MIN_WEIGHT = 0.05;
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
export const CHANGE_TYPE: Record<
  Polarity,
  "negative" | "neutral" | "positive"
> = {
  [-1]: "negative",
  0: "neutral",
  1: "positive",
};
