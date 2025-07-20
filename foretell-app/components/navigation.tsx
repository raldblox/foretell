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
import ConnectButton from "./connect";
import CreateSurveyModal from "@/actions/create-survey";

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
  // let connectButton = null;

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

        <NavbarItem className="!flex items-center gap-1">
          <CreateSurveyModal customMessage="Create survey" size="sm" />
          <span className="hidden md:flex">
            <ConnectButton size="sm" />
          </span>
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
