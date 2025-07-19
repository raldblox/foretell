"use client";

import type { NavbarProps } from "@heroui/react";

import React, { useEffect, useState, useCallback } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Button,
  addToast,
  Image,
} from "@heroui/react";
import { signIn, signOut, useSession, getCsrfToken } from "next-auth/react";
import { Icon } from "@iconify/react";

import { Logo } from "./icons";
import { ThemeSwitch } from "./theme-switch";
import GradientText from "./GradientText/GradientText";
import { useProfile, SignInButton } from "@farcaster/auth-kit";
import {
  useMiniKit,
  useNotification,
  useViewProfile,
} from "@coinbase/onchainkit/minikit";
import { sdk } from "@farcaster/miniapp-sdk";

const menuItems = [
  "About",
  "Blog",
  "Customers",
  "Pricing",
  "Enterprise",
  "Changelog",
  "Documentation",
  "Contact Us",
];

export default function Navigation(props: NavbarProps) {
  // TWITtER AUTH //
  const { data: session } = useSession();
  const { isFrameReady: isCoinbase } = useMiniKit();
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [miniAppFid, setMiniAppFid] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (typeof window !== "undefined") {
        try {
          const result = await sdk.isInMiniApp();
          setIsMiniApp(result);
          if (result) {
            const context = await sdk.context;
            setMiniAppFid(
              context?.user?.fid ? context.user.fid.toString() : null
            );
          }
        } catch {}
      }
    })();
  }, []);

  // Render logic
  let connectButton = null;

  if (session) {
    // Show connected provider and user info, plus sign out
    const provider = (session.user as any)?.provider;
    const nameOrId = session.user?.name || session.user?.id;
    connectButton = (
      <div className="flex items-center gap-2">
        <Button radius="full" size="sm" variant="flat" disabled>
          {(() => {
            if (provider === "twitter")
              return (
                <Icon
                  icon="hugeicons:new-twitter"
                  width={16}
                  className="mr-1"
                />
              );
            if (provider === "farcaster")
              return <Icon icon="mdi:castle" width={16} className="mr-1" />;
            if (provider === "coinbase")
              return <Icon icon="mdi:coin" width={16} className="mr-1" />;
            return null;
          })()}
          {nameOrId}
        </Button>
        <Button
          color="danger"
          radius="full"
          size="sm"
          variant="flat"
          onPress={() => signOut({ callbackUrl: "/" })}
        >
          Sign out
        </Button>
      </div>
    );
  } else if (isMiniApp) {
    connectButton = miniAppFid ? (
      <Button
        radius="full"
        size="sm"
        variant="solid"
        className="bg-[#6746f9] text-white flex items-center gap-2"
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
        <Image src="/farcaster.svg" width={18} height={18} alt="Farcaster" />
        {miniAppFid}
      </Button>
    ) : (
      <Button
        radius="full"
        size="sm"
        variant="solid"
        className="bg-[#6746f9] text-white flex items-center gap-2"
        onPress={async () => {
          try {
            const nonce = await getCsrfToken();
            if (!nonce) throw new Error("Unable to generate nonce");
            const result = await sdk.actions.signIn({
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
  } else if (isCoinbase) {
    connectButton = (
      <Button
        radius="full"
        size="sm"
        variant="flat"
        className="flex items-center gap-2"
        onPress={() => {}}
        disabled
      >
        <Icon icon="mdi:coin" width={18} className="" />
        Connect Coinbase (coming soon)
      </Button>
    );
  } else {
    connectButton = (
      <Button
        radius="full"
        size="sm"
        variant="flat"
        className="flex items-center gap-2"
        onPress={() => signIn("twitter", { callbackUrl: "/" })}
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
      >
        Connect
        <Icon icon="hugeicons:new-twitter" width={18} className="" />
      </Button>
    );
  }

  return (
    <Navbar
      position="sticky"
      shouldHideOnScroll
      {...props}
      classNames={{
        base: "p-3 backdrop-filter-none bg-transparent",
        wrapper: "px-0 w-full justify-center bg-transparent",
        item: "hidden md:flex",
      }}
      height="50px"
      maxWidth="sm"
    >
      <NavbarContent
        className="gap-4 w-full rounded-full border-small border-default-200/20 bg-background/60 px-2 shadow-medium backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50"
        justify="center"
      >
        {/* Toggle */}
        {/* <NavbarMenuToggle className="ml-2 text-default-400 md:hidden" /> */}

        {/* Logo */}
        <NavbarBrand className="mr-2 w-full flex items-center">
          <Link href="/" className="text-foreground">
            <Logo />
            <GradientText
              className="bg-transparent px-3"
              animationSpeed={3}
              colors={["#f31260", "#f5a524", "#17c964", "#f5a524", "#f31260"]}
              showBorder={false}
            >
              FORETELL
            </GradientText>
          </Link>
        </NavbarBrand>

        <NavbarItem className="!flex gap-3">
          <ThemeSwitch />
          {connectButton}
        </NavbarItem>
      </NavbarContent>

      {/* Menu */}
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full"
              color={
                index === 2
                  ? "primary"
                  : index === menuItems.length - 1
                    ? "danger"
                    : "foreground"
              }
              href="#"
              size="lg"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
