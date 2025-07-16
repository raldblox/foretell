"use client";

import { Link } from "@heroui/react";
import React from "react";

const Footer = () => {
  return (
    <footer className="w-full flex border-t border-default-100 items-center justify-center py-6">
      <Link
        isExternal
        className="flex items-center gap-1 text-current"
        href="https://heroui.com?utm_source=next-app-template"
        title="heroui.com homepage"
      >
        <span className="text-default-600">Powered by</span>
        <p className="text-primary">HeroUI</p>
      </Link>
    </footer>
  );
};

export default Footer;
