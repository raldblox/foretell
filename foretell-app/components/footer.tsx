"use client";

import { Link } from "@heroui/react";
import React from "react";

const Footer = () => {
  return (
    <footer className="w-full z-50 flex border-t bg-background/50 border-default-100 items-center justify-center py-6">
      <Link
        isExternal
        className="flex items-center gap-1 font-bold text-default-800"
        href="https://onchainsupply.net?utm_source=foretell&utm_medium=footer&utm_campaign=powered_by"
        title="heroui.com homepage"
      >
        Foretell -
        <span className="text-default-600">Powered by OnChainSupply</span>
      </Link>
    </footer>
  );
};

export default Footer;
