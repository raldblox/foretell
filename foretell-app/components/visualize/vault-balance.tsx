"use client";

import { useEffect, useState } from "react";

import { Vault } from "@/types";
import { Snippet } from "@heroui/react";

export const VaultBalance = ({ vault }: { vault: Vault }) => {
  const [wethBalance, setWethBalance] = useState<string | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!vault.vaultAddress || !vault.chainId) {
      setIsLoading(false);

      return;
    }

    const fetchBalanceAndSymbol = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/vault?vaultAddress=${vault.vaultAddress}&chainId=${vault.chainId}`
        );
        const data = await response.json();

        if (response.ok) {
          setWethBalance(data.balance);
          setTokenSymbol(data.symbol);
        } else {
          console.error("Error from API:", data.error);
          setWethBalance(null);
          setTokenSymbol(null);
        }
      } catch (error) {
        console.error("Error fetching vault balance or symbol:", error);
        setWethBalance(null);
        setTokenSymbol(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalanceAndSymbol();
  }, [vault.vaultAddress, vault.chainId]);

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex gap-3 items-center">
        <span>Balance:</span>
        <span className="font-semibold text-sm">
          {isLoading
            ? "Loading..."
            : wethBalance !== null && tokenSymbol !== null
              ? `${parseFloat(wethBalance).toFixed(4)} ${tokenSymbol}`
              : "0.0000 WETH"}
        </span>
      </div>
      
    </div>
  );
};
