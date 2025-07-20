import React, { useContext } from "react";
import { Button, addToast, Image } from "@heroui/react";
import { signIn, signOut, useSession, getCsrfToken } from "next-auth/react";
import { Icon } from "@iconify/react";
import { sdk } from "@farcaster/miniapp-sdk";
import { AppContext } from "@/app/providers";

export default function ConnectButton({ size }: { size: "sm" | "md" | "lg" }) {
  const { data: session } = useSession();
  const { isMiniApp, miniAppFid, isWallet } = useContext(AppContext);

  if (session) {
    const provider = (session.user as any)?.provider;
    // const nameOrId = session.user?.name || session.user?.id;
    return (
      <div className="flex w-fit mx-auto items-center gap-1 p-1 border-1 border-default-100 rounded-full">
        <Button
          isIconOnly
          disabled
          radius="full"
          size={size}
          color="default"
          variant="flat"
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
          color="danger"
          radius="full"
          size={size}
          variant="flat"
          onPress={() => signOut({ callbackUrl: "/" })}
        >
          Sign out
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
  } else if (isWallet) {
    return (
      <Button
        disabled
        className="flex items-center gap-2"
        radius="full"
        size={size}
        variant="flat"
        onPress={() => {}}
      >
        <Icon className="" icon="mdi:coin" width={18} />
        Connect Wallet
      </Button>
    );
  } else {
    return (
      <Button
        className="flex items-center gap-2 "
        radius="full"
        size={size}
        variant="flat"
        onContextMenu={(e) => {
          e.preventDefault();
          window.location.href = "/login";
        }}
        onPointerDown={(e) => {
          if (e.pointerType === "touch") {
            (e.target as HTMLElement).setAttribute("data-longpress", "start");
            setTimeout(() => {
              if (
                (e.target as HTMLElement).getAttribute("data-longpress") ===
                "start"
              ) {
                window.location.href = "/login";
              }
            }, 500);
          }
        }}
        onPointerUp={(e) => {
          if (e.pointerType === "touch") {
            (e.target as HTMLElement).removeAttribute("data-longpress");
          }
        }}
        onPress={() => signIn("twitter", { callbackUrl: "/" })}
      >
        Connect
        <Icon className="" icon="hugeicons:new-twitter" width={18} />
      </Button>
    );
  }
}
