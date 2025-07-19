"use client";

import type { NavbarProps } from "@heroui/react";

import React, { useEffect, useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Button,
} from "@heroui/react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Icon } from "@iconify/react";

import { Logo } from "./icons";
import { ThemeSwitch } from "./theme-switch";
import GradientText from "./GradientText/GradientText";
import { useProfile } from "@farcaster/auth-kit";
import {
  useMiniKit,
  useNotification,
  useViewProfile,
} from "@coinbase/onchainkit/minikit";

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
  const { profile } = useProfile();
  const { isFrameReady: isCoinbase } = useMiniKit();
  const [isFarcasterFrame, setIsFarcasterFrame] = useState(false);
  const [loading, setLoading] = useState(false);

  // Detect Farcaster frame on mount (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // @ts-ignore
        if (typeof window.frameContext === "string" || typeof window.farcaster === "object") {
          setIsFarcasterFrame(true);
        }
      } catch {}
    }
  }, []);

  // Render logic
  let connectButton = null;
  if (isCoinbase) {
    // Only show Coinbase connect (TODO: add connect logic if available)
    connectButton = (
      <Button
        radius="full"
        size="sm"
        variant="flat"
        // onPress={connectCoinbase} // Not available in current hook
      >
        Connect Coinbase
      </Button>
    );
  } else if (isFarcasterFrame && profile && !profile.fid) {
    // Only show Farcaster connect if in Farcaster frame
    connectButton = (
      <Button
        radius="full"
        size="sm"
        variant="flat"
        disabled
        // TODO: Add connect logic when available
      >
        Connect Farcaster
      </Button>
    );
  } else if (isFarcasterFrame && profile && profile.fid) {
    connectButton = (
      <Button
        radius="full"
        size="sm"
        variant="flat"
      >
        {profile?.username || "Farcaster User"}
      </Button>
    );
  } else {
    // Fallback to Twitter
    connectButton = !session ? (
      <Button
        radius="full"
        size="sm"
        variant="flat"
        onPress={() => signIn("twitter")}
      >
        Connect
        <Icon className="" icon="hugeicons:new-twitter" width={16} />
      </Button>
    ) : (
      <Button
        color="danger"
        radius="full"
        size="sm"
        variant="flat"
        onPress={() => signOut()}
      >
        Sign out
      </Button>
    );
  }

  // FARCASTER FRAMES //

  const viewProfile = useViewProfile();

  const handleViewProfile = () => {
    viewProfile();
  };

  // COINBASE MINI APP //

  const { setFrameReady, isFrameReady, context } = useMiniKit(); // coinbase mini app

  const sendNotification = useNotification();

  const handleSendNotification = async () => {
    try {
      await sendNotification({
        title: "You're in! 🎉",
        body: "You may now start foretelling!",
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  };

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
      handleSendNotification();
    }
  }, [setFrameReady, isFrameReady]);

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

        <NavbarItem className="ml-2 !flex gap-3">
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
