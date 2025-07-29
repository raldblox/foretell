import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbiItem,
  decodeEventLog,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { getCollection } from "@/lib/mongodb";
import {
  OpenSurveyVaultFactoryAbi,
  getFactoryAddress,
  getChain,
} from "@/lib/contracts";

const VaultSchema = z.object({
  surveyId: z.string().min(1),
  chainId: z.number().int().positive(),
});

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
