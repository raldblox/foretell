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

import { Logo } from "./icons";
import GradientText from "./GradientText/GradientText";

import CreateSurveyModal from "@/actions/create-survey";
import ConnectButton from "./connect";

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
        <NavbarBrand className="mx-1 w-full flex items-center">
          <Link className="text-foreground" href="/">
            <Logo size={30} />
            <span className="hidden md:flex">
              <GradientText
                animationSpeed={3}
                className="bg-transparent px-3 hidden md:flex"
                colors={["#f31260", "#f5a524", "#17c964", "#f5a524", "#f31260"]}
                showBorder={false}
              >
                FORETELL
              </GradientText>
            </span>
          </Link>
        </NavbarBrand>

        <NavbarItem className="!flex items-center gap-1 mr-1">
          <ConnectButton size="sm" />
          <CreateSurveyModal customMessage="Create survey" size="sm" />

          {/* {connectButton} */}
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
