"use client";

import { Button, Link, Snippet } from "@heroui/react";
import React from "react";
import { useAddFundsModal } from "@0xsequence/checkout";

import { VaultBalance } from "./vault-balance";

import { Vault } from "@/types";
import { getBlockExplorerUrl, getChainName } from "@/lib/contracts";

export const OnchainVault = ({ vaults }: { vaults: Vault[] }) => {
  const { triggerAddFunds: toggleAddFunds } = useAddFundsModal();

  return (
    <>
      <section className="md:p-3 pt-4 rounded-lg border border-default-100 space-y-3">
        <h2 className="text-xl px-3 font-medium">Vaults</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {vaults?.map((vault, i) => (
            <div
              key={i}
              className=" p-3 flex flex-col rounded-lg bg-default-50 space-y-3"
            >
              <div className="flex gap-3 items-center justify-between">
                <span className="font-semibold text-sm">
                  {getChainName(vault.chainId)}
                </span>

                <Link
                  isExternal
                  showAnchorIcon
                  className="text-xs"
                  href={getBlockExplorerUrl(vault.chainId, vault.vaultAddress)}
                >
                  {`${vault.vaultAddress.slice(0, 6)}...${vault.vaultAddress.slice(-4)}`}
                </Link>
              </div>

              <VaultBalance vault={vault} />
              <div className="flex gap-2 items-center">
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  onPress={() => {
                    toggleAddFunds({
                      walletAddress: vault.vaultAddress,
                    });
                  }}
                  className="px-3"
                >
                  Fund
                </Button>

                <Snippet
                  variant="flat"
                  symbol="Vault:"
                  className="pl-4 w-full rounded-lg bg-default-100"
                  codeString={vault.vaultAddress}
                  radius="sm"
                  size="sm"
                >
                  <span>
                    {vault.vaultAddress.slice(0, 6)}...
                    {vault.vaultAddress.slice(-4)}
                  </span>
                </Snippet>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};
