import type { Chain } from "viem/chains";

import { etherlink, etherlinkTestnet } from "viem/chains";

import OpenSurveyRewardVaultJson from "@/lib/abis/OpenSurveyRewardVault.json";
import OpenSurveyVaultFactoryJson from "@/lib/abis/OpenSurveyVaultFactory.json";

export const OpenSurveyRewardVaultAbi = OpenSurveyRewardVaultJson.abi;
export const OpenSurveyVaultFactoryAbi = OpenSurveyVaultFactoryJson.abi;

export const WETH_ADDRESSES: { [chainId: number]: `0x${string}` } = {
  [etherlinkTestnet.id]: "0xB1Ea698633d57705e93b0E40c1077d46CD6A51d8",
  [etherlink.id]: "0xc9B53AB2679f573e480d01e0f49e2B5CFB7a3EAb",
};

export const FACTORY_ADDRESSES: { [chainId: number]: `0x${string}` } = {
  [etherlinkTestnet.id]: "0xf1805Bc3F6C8dA9b3D7A69257BA3888F7194fFE7",
  [etherlink.id]: "0xd04f8B4c51e4C111486f2F2C6633a8729a14A82a",
};

export const CHAINS: { [chainId: number]: Chain } = {
  [etherlinkTestnet.id]: etherlinkTestnet,
};

export const getFactoryAddress = (
  chainId: number,
): `0x${string}` | undefined => {
  return FACTORY_ADDRESSES[chainId];
};

export const getChain = (chainId: number): Chain | undefined => {
  return CHAINS[chainId];
};

export const getBlockExplorerUrl = (
  chainId: number,
  address: string,
): string | undefined => {
  const chain = getChain(chainId);

  if (chain && chain.blockExplorers?.default.url) {
    return `${chain.blockExplorers.default.url}/address/${address}`;
  }

  return undefined;
};

export const getChainName = (chainId: number): string | undefined => {
  const chain = getChain(chainId);

  if (chain && chain.name) {
    return chain.name;
  }

  return undefined;
};
