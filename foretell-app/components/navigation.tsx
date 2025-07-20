"use client";

import type { NavbarProps } from "@heroui/react";

import React, { useContext } from "react";
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
import { sdk } from "@farcaster/miniapp-sdk";

import { Logo } from "./icons";
import GradientText from "./GradientText/GradientText";

import { AppContext } from "@/app/providers";

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
  const { isMiniApp, miniAppFid, isWallet } = useContext(AppContext);

  // Render logic
  let connectButton = null;

  if (session) {
    // Show connected provider and user info, plus sign out
    const provider = (session.user as any)?.provider;
    const nameOrId = session.user?.name || session.user?.id;

    connectButton = (
      <div className="flex items-center gap-1 p-1 border-1 border-default-100 rounded-full">
        <Button
          isIconOnly
          disabled
          radius="full"
          size="sm"
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
        className="bg-[#6746f9] text-white flex items-center gap-2 m-1"
        radius="full"
        size="sm"
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
        size="sm"
        variant="solid"
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
  } else if (isWallet) {
    connectButton = (
      <Button
        disabled
        className="flex items-center gap-2"
        radius="full"
        size="sm"
        variant="flat"
        onPress={() => {}}
      >
        <Icon className="" icon="mdi:coin" width={18} />
        Connect Wallet
      </Button>
    );
  } else {
    connectButton = (
      <Button
        className="flex items-center gap-2 m-1"
        radius="full"
        size="sm"
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

  return (
    <Navbar
      shouldHideOnScroll
      position="sticky"
      {...props}
      classNames={{
        base: "p-3 backdrop-filter-none bg-transparent",
        wrapper: "px-0 w-full justify-center bg-transparent",
        item: "hidden md:flex",
      }}
      height="46px"
      maxWidth="full"
    >
      <NavbarContent
        className="gap-4 w-full rounded-full bg-background/50 p-1 shadow-medium backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50"
        justify="center"
      >
        {/* Toggle */}
        {/* <NavbarMenuToggle className="ml-2 text-default-400 md:hidden" /> */}

        {/* Logo */}
        <NavbarBrand className="mr-2 w-full flex items-center">
          <Link className="text-foreground" href="/">
            <Logo />
            <GradientText
              animationSpeed={3}
              className="bg-transparent px-3"
              colors={["#f31260", "#f5a524", "#17c964", "#f5a524", "#f31260"]}
              showBorder={false}
            >
              FORETELL
            </GradientText>
          </Link>
        </NavbarBrand>

        <NavbarItem className="!flex gap-3">{connectButton}</NavbarItem>
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
