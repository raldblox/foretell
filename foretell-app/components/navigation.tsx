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
  const [isFarcasterFrame, setIsFarcasterFrame] = useState(false);
  const [error, setError] = useState(false);

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

  // Get nonce for Farcaster sign-in
  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);

  // Handle Farcaster sign-in success
  const handleFarcasterSuccess = useCallback((res: any) => {
    signIn("credentials", {
      message: res.message,
      signature: res.signature,
      name: res.username,
      pfp: res.pfpUrl,
      redirect: false,
    });
    addToast({
      title: "Farcaster is connected!",
      description: `UID: ${res.fid}`,
      color: "secondary",
    });
  }, []);

  // Render logic
  let connectButton = null;
  if (session) {
    connectButton = (
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
  } else if (isCoinbase) {
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
  } else if (isFarcasterFrame) {
    connectButton = (
      <>
        <SignInButton
          nonce={getNonce}
          onSuccess={handleFarcasterSuccess}
          onError={() => setError(true)}
        />
        {error && <div>Unable to sign in with Farcaster at this time.</div>}
      </>
    );
  } else {
    connectButton = (
      <Button
        radius="full"
        size="sm"
        variant="flat"
        onPress={() => signIn("twitter")}
      >
        Connect
        <Icon className="" icon="hugeicons:new-twitter" width={16} />
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
