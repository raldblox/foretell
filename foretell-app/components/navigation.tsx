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

  // Render logic
  let connectButton = null;

  // FARCASTER FRAMES //

  const farcasterProfile = useViewProfile();

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

        <NavbarItem className="mx-2 !flex gap-3">
          <ThemeSwitch />
          {session ? (
            <div className="flex items-center gap-2">
              <Button radius="full" size="sm" variant="flat" disabled>
                {(() => {
                  const provider = (session.user as any)?.provider;
                  if (provider === "twitter")
                    return <Icon icon="hugeicons:new-twitter" width={16} />;
                  if (provider === "farcaster")
                    return <Icon icon="mdi:castle" width={16} />;
                  if (provider === "coinbase")
                    return <Icon icon="mdi:coin" width={16} />;
                  return null;
                })()}
                {session.user?.name || session.user?.id}
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
          ) : (
            <Button
              radius="full"
              size="sm"
              variant="flat"
              onPress={() => signIn("twitter", { callbackUrl: "/" })}
              onContextMenu={e => {
                e.preventDefault();
                window.location.href = "/login";
              }}
              onPointerDown={e => {
                if (e.pointerType === "touch") {
                  (e.target as HTMLElement).setAttribute("data-longpress", "start");
                  setTimeout(() => {
                    if ((e.target as HTMLElement).getAttribute("data-longpress") === "start") {
                      window.location.href = "/login";
                    }
                  }, 500); // 600ms for long press
                }
              }}
              onPointerUp={e => {
                if (e.pointerType === "touch") {
                  (e.target as HTMLElement).removeAttribute("data-longpress");
                }
              }}
            >
              Connect
              <Icon className="mr-1" icon="hugeicons:new-twitter" width={18} />
            </Button>
          )}
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
