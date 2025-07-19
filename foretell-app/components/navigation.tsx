"use client";

import type { NavbarProps } from "@heroui/react";

import React from "react";
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
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return (
    <Navbar
      // position="sticky"
      // shouldHideOnScroll
      {...props}
      classNames={{
        base: "py-6 backdrop-filter-none bg-transparent",
        wrapper: "px-0 w-full justify-center bg-transparent",
        item: "hidden md:flex",
      }}
      height="50px"
      maxWidth="sm"
    >
      <NavbarContent
        className="gap-4 md:w-full rounded-full border-small border-default-200/20 bg-background/60 px-2 shadow-medium backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50"
        justify="center"
      >
        {/* Toggle */}
        {/* <NavbarMenuToggle className="ml-2 text-default-400 md:hidden" /> */}

        {/* Logo */}
        <NavbarBrand className="mr-2 md:w-auto md:max-w-full flex items-center">
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
          {!session ? (
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
              // startContent={
              //   <Icon
              //     icon="majesticons:logout-half-circle"
              //     width={20}
              //     className="text-danger"
              //   />
              // }
              color="danger"
              radius="full"
              size="sm"
              variant="flat"
              onPress={() => signOut()}
            >
              Sign out
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
