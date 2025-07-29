import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbiItem,
  decodeEventLog,
  formatEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { getCollection } from "@/lib/mongodb";
import {
  OpenSurveyVaultFactoryAbi,
  getFactoryAddress,
  getChain,
  WETH_ADDRESSES,
} from "@/lib/contracts";

const VaultSchema = z.object({
  surveyId: z.string().min(1),
  chainId: z.number().int().positive(),
});

// Minimal ABI for ERC20 balanceOf and symbol functions
const erc20Abi = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vaultAddress = searchParams.get("vaultAddress");
  const chainId = searchParams.get("chainId");

  if (!vaultAddress || !chainId) {
    return NextResponse.json(
      { error: "Missing vaultAddress or chainId" },
      { status: 400 },
    );
  }

  const parsedChainId = parseInt(chainId, 10);

  if (isNaN(parsedChainId)) {
    return NextResponse.json({ error: "Invalid chainId" }, { status: 400 });
  }

  const chain = getChain(parsedChainId);
  const tokenAddress = WETH_ADDRESSES[parsedChainId];

  if (!chain || !tokenAddress) {
    return NextResponse.json(
      { error: "Chain or WETH address not found for the given chainId" },
      { status: 400 },
    );
  }

  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  try {
    const balance = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [vaultAddress as `0x${string}`],
    });

    const symbol = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "symbol",
    });

    return NextResponse.json({
      balance: formatEther(balance),
      symbol,
    });
  } catch (error: any) {
    console.error("Error fetching vault balance or symbol:", error);

    return NextResponse.json(
      { error: error.message || "Failed to fetch vault balance or symbol" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parse = VaultSchema.safeParse(body);

  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });
  }

  const { surveyId, chainId } = parse.data;

  const surveysCollection = await getCollection("surveys");
  const surveyExists = await surveysCollection.findOne({ surveyId });

  if (!surveyExists) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  const factoryAddress = getFactoryAddress(chainId);
  const chain = getChain(chainId);

  if (!factoryAddress || !chain) {
    return NextResponse.json(
      { error: "Factory contract address or chain not found." },
      { status: 400 },
    );
  }

  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  // Check if vault already exists on-chain
  const existingVaultAddress = await publicClient.readContract({
    address: factoryAddress,
    abi: OpenSurveyVaultFactoryAbi,
    functionName: "getVault",
    args: [surveyId],
  });

  if (
    existingVaultAddress &&
    existingVaultAddress !== "0x0000000000000000000000000000000000000000"
  ) {
    return NextResponse.json({ vaultAddress: existingVaultAddress });
  }

  try {
    const account = privateKeyToAccount(
      process.env.WALLET_PRIVATE_KEY as `0x${string}`,
    );

    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(),
    });

    const { request } = await publicClient.simulateContract({
      address: factoryAddress,
      abi: OpenSurveyVaultFactoryAbi,
      functionName: "createVault",
      args: [surveyId],
      account,
    });

    const hash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    const vaultCreatedEvent = parseAbiItem(
      "event VaultCreated(string indexed surveyId, address vault)",
    );

    let vaultAddress: string | null = null;

    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: [vaultCreatedEvent],
          data: log.data,
          topics: log.topics,
        });

        if (decoded.eventName === "VaultCreated") {
          vaultAddress = decoded.args.vault;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!vaultAddress) {
      throw new Error("VaultCreated event not found.");
    }

    console.log("Vault Address:", vaultAddress);

    return NextResponse.json({ vaultAddress });
  } catch (error: any) {
    console.error("Vault creation error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create vault on chain." },
      { status: 500 },
    );
  }
}
