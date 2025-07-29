"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Spinner } from "@heroui/react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from "wagmi";
import { Hex, createPublicClient, http } from "viem";
import * as allChains from "viem/chains";
import { FACTORY_ADDRESSES, OpenSurveyVaultFactoryAbi, OpenSurveyRewardVaultAbi } from "@/lib/contracts";

interface MerkleRootUpdaterProps {
  surveyId: string;
}

interface MerklePreviewData {
  merkleRoot: Hex;
  leavesData: { address: Hex; amount: string }[];
  leaves: Hex[];
}

export default function MerkleRootUpdater({ surveyId }: MerkleRootUpdaterProps) {
  const [merklePreview, setMerklePreview] = useState<MerklePreviewData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenAddress, setTokenAddress] = useState<Hex | "">("");

  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const {
    data: hash,
    writeContract,
    isPending: isSettingRoot,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    const fetchMerklePreview = async () => {
      setLoadingPreview(true);
      setError(null);
      try {
        const res = await fetch(`/api/vault?surveyId=${surveyId}`);
        const data = await res.json();
        if (res.ok) {
          setMerklePreview(data);
        } else {
          setError(data.error || "Failed to fetch Merkle preview");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching Merkle preview");
      } finally {
        setLoadingPreview(false);
      }
    };

    if (surveyId) {
      fetchMerklePreview();
    }
  }, [surveyId]);

  const handleSetMerkleRoot = async () => {
    if (!merklePreview || !merklePreview.merkleRoot) {
      setError("No Merkle root to set.");
      return;
    }
    if (!tokenAddress) {
      setError("Please enter a token address.");
      return;
    }
    if (!address || !isConnected) {
      setError("Wallet not connected.");
      return;
    }

    try {
      const factoryAddress = FACTORY_ADDRESSES[chainId];
      if (!factoryAddress) {
        setError(`No factory address found for chainId: ${chainId}`);
        return;
      }

      // Fetch vault address from factory
      const targetChain = Object.values(allChains).find(chain => chain.id === chainId);
      if (!targetChain) {
        setError(`Unsupported chainId: ${chainId}`);
        return;
      }

      const publicClient = createPublicClient({
        chain: targetChain,
        transport: http(),
      });

      const vaultAddress = await publicClient.readContract({
        address: factoryAddress,
        abi: OpenSurveyVaultFactoryAbi,
        functionName: "getVault",
        args: [surveyId],
      });

      if (vaultAddress === "0x0000000000000000000000000000000000000000") {
        setError(`Vault not found for surveyId: ${surveyId} on chainId: ${chainId}`);
        return;
      }

      writeContract({
        address: vaultAddress,
        abi: OpenSurveyRewardVaultAbi,
        functionName: "setMerkleRoot",
        args: [tokenAddress, merklePreview.merkleRoot],
      });
    } catch (err: any) {
      console.error("Error setting Merkle root:", err);
      setError(err.message || "An error occurred while setting Merkle root.");
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      alert("Merkle Root set successfully!");
      // Optionally refetch preview or update UI
    } else if (writeError) {
      setError(writeError.message || "Failed to set Merkle root on chain.");
    }
  }, [isConfirmed, writeError]);

  return (
    <div className="p-4 border rounded-lg mt-4 w-full max-w-md">
      <h2 className="text-lg font-semibold mb-2">Merkle Root Management</h2>
      {loadingPreview && <Spinner size="sm" />}
      {error && <div className="text-danger text-sm mb-2">{error}</div>}

      {merklePreview && (
        <div className="mb-4">
          <p className="text-sm">Merkle Root: <span className="font-mono break-all">{merklePreview.merkleRoot}</span></p>
          <p className="text-sm">Total Leaves: {merklePreview.leavesData.length}</p>
          <h3 className="text-md font-medium mt-2">Preview Leaves:</h3>
          <ul className="text-xs max-h-40 overflow-y-auto border p-2 rounded">
            {merklePreview.leavesData.map((leaf, index) => (
              <li key={index} className="break-all">{leaf.address}: {leaf.amount.toString()}</li>
            ))}
          </ul>
        </div>
      )}

      <Input
        label="Token Address"
        placeholder="0x..." 
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value as Hex)}
        className="mb-4"
      />

      <Button
        fullWidth
        color="primary"
        onClick={handleSetMerkleRoot}
        isLoading={isSettingRoot || isConfirming}
        disabled={!merklePreview || !merklePreview.merkleRoot || !tokenAddress || !isConnected}
      >
        {isSettingRoot ? "Setting Merkle Root..." : isConfirming ? "Confirming..." : "Set Merkle Root on Chain"}
      </Button>
    </div>
  );
}