import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type AsyncProps = {
  params: Promise<{ surveyId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export type Polarity = -1 | 0 | 1;
export type Resolution = "time" | "quantity";
export interface ResponseEntry {
  uid: string;
  polarity: Polarity;
  score: number;
  intensity?: number;
  answer?: string;
  createdAt?: string; // ISO string, server-side timestamp
  rewardAmount?: number;
}

export interface Vault {
  chainId: number;
  vaultAddress: string;
  merkleProof?: string;
}

export interface Survey {
  surveyId: string;
  title: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  expiry?: string;
  maxResponses?: number;
  responses?: ResponseEntry[];
  rewardPool?: Reward;
  allowAnonymity?: boolean;
  discoverable?: boolean;
  rewards?: Reward;
  isDemo?: boolean;
  vaults?: Vault[];
}

export interface Reward {
  chainId: string;
  nativeToken: boolean;
  rewardPool: number;
  tokenAddress: string;
}

export interface WeightedEntry extends ResponseEntry {
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
