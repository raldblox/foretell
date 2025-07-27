import React, { useContext } from "react";
import { Button, addToast, Image, ButtonGroup } from "@heroui/react";
import { signIn, signOut, useSession, getCsrfToken } from "next-auth/react";
import { Icon } from "@iconify/react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useOpenConnectModal } from "@0xsequence/connect";
import { useWallets } from "@0xsequence/connect";

import { AppContext } from "@/app/providers";

export default function ConnectButton({
  size,
  fullWidth,
}: {
  size: "sm" | "md" | "lg";
  fullWidth?: boolean;
}) {
  const { data: session } = useSession();
  const { isMiniApp, miniAppFid } = useContext(AppContext);
  const { setOpenConnectModal } = useOpenConnectModal(); // Sequence Modal
  const { wallets, disconnectWallet } = useWallets(); // Sequence Wallet

  if (session) {
    const provider = (session.user as any)?.provider;

    // const nameOrId = session.user?.name || session.user?.id;
    return (
      <div className="flex w-fit mx-auto items-center gap-0.5 p-1 border-1 border-default-100 rounded-full">
        <Button
          isIconOnly
          className="hover:bg-danger"
          color="default"
          radius="full"
          size={size}
          variant="solid"
          onPress={() => signOut({ callbackUrl: "/" })}
        >
          {(() => {
            if (provider === "twitter")
              return <Icon icon="hugeicons:new-twitter" width={16} />;
            if (provider === "farcaster")
              return <Icon icon="mdi:castle" width={16} />;
            if (provider === "siwe") return <Icon icon="mdi:coin" width={16} />;

            return null;
          })()}
        </Button>
        <Button
          className="text-foreground"
          color="default"
          radius="full"
          size={size}
          variant="solid"
        >
          {session?.user?.name}
        </Button>
      </div>
    );
  } else if (isMiniApp) {
    return miniAppFid ? (
      <Button
        className="bg-[#6746f9] text-white flex items-center gap-2 "
        radius="full"
        size={size}
        variant="solid"
        onPress={async () => {
          try {
            await sdk.actions.viewProfile({ fid: Number(miniAppFid) });
          } catch (error: any) {
            addToast({
              title: "Profile view failed",
              description: error?.message || "Unknown error",
              color: "danger",
            });
          }
        }}
      >
        <Image alt="Farcaster" height={18} src="/farcaster.svg" width={18} />
        {miniAppFid}
      </Button>
    ) : (
      <Button
        className="bg-[#6746f9] text-white flex items-center gap-2"
        radius="full"
        size={size}
        variant="solid"
        onPress={async () => {
          try {
            const nonce = await getCsrfToken();

            if (!nonce) throw new Error("Unable to generate nonce");
            await sdk.actions.signIn({
              nonce,
              acceptAuthAddress: true,
            });
            addToast({
              title: "Farcaster sign-in initiated",
              description: "Check your Farcaster app for the sign-in prompt.",
              color: "success",
            });
          } catch (error: any) {
            if (error.name === "RejectedByUser") {
              addToast({
                title: "Sign-in rejected",
                description: "You rejected the sign-in request.",
                color: "warning",
              });
            } else {
              addToast({
                title: "Farcaster sign-in failed",
                description: error?.message || "Unknown error",
                color: "danger",
              });
            }
          }
        }}
      >
        Connect Farcaster
      </Button>
    );
  } else if (wallets.length > 0) {
    return (
      <>
        {wallets.map((wallet) => (
          <div key={wallet.address}>
            <ButtonGroup radius="full">
              <Button
                className="flex items-center gap-2"
                radius="full"
                size={size}
                variant="flat"
                onPress={() => {
                  setOpenConnectModal(true);
                }}
              >
                {wallet.address.slice(0, 6)}...
                {wallet.address.slice(-4)}
              </Button>
              <Button
                isIconOnly
                className="text-danger"
                radius="full"
                size={size}
                variant="flat"
                onPress={() => disconnectWallet(wallet.address)}
              >
                <Icon height="24" icon="memory:alpha-x-fill" width="24" />
              </Button>
            </ButtonGroup>
          </div>
        ))}
      </>
    );
  } else {
    return (
      <>
        <Button
          className="flex text-small font-medium leading-5 items-center gap-2 "
          fullWidth={fullWidth}
          radius="full"
          size={size}
          variant="solid"
          onPress={() => signIn("twitter", { callbackUrl: "/" })}
        >
          Connect
          <Icon
            className=""
            height="18"
            icon="hugeicons:new-twitter"
            width="18"
          />
        </Button>
        <Button
          className="flex text-small font-medium leading-5 items-center gap-2 "
          endContent={
            <Icon className="" height="24" icon="memory:email" width="24" />
          }
          radius="full"
          size={size}
          variant="solid"
          onPress={() => setOpenConnectModal(true)}
        >
          Connect
        </Button>
      </>
    );
  }
}
