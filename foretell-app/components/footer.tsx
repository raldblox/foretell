"use client";

import React, { Suspense } from "react";
import { ThemeSwitch } from "./theme-switch";
import { Link } from "@heroui/react";

const Footer = () => {
  return (
    <footer className="w-full z-50 flex border-t bg-background/50 border-default-100 items-center justify-between p-6">
      <div>
        <Link
          isExternal
          className="flex text-sm items-center gap-1 font-bold text-default-500"
          href="https://onchainsupply.net?utm_source=foretell&utm_medium=footer&utm_campaign=powered_by"
          title="heroui.com homepage"
        >
          &copy; Foretell 2025
        </Link>
      </div>
      <div>
        <Suspense>
          <ThemeSwitch />
        </Suspense>
      </div>
    </footer>
  );
};

export default Footer;
