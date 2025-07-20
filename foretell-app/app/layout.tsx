import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { Suspense } from "react";

import { Providers, NextAuthProvider } from "./providers";

import { fontSans } from "@/config/fonts";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

// export const metadata: Metadata = {
//   title: {
//     default: siteConfig.name,
//     template: `%s - ${siteConfig.name}`,
//   },
//   description: siteConfig.description,
//   icons: {
//     icon: "/favicon.ico",
//   },
// };

export const generateMetadata = (): Metadata => {
  return {
    title: "Foretell",
    description: "It' i's foretelling time!",
    other: {
      "fc:frame": JSON.stringify({
        version: "1",
        imageUrl: "https://foretell.one/image.png",
        button: {
          title: "Launch Foretell",
          action: {
            type: "launch_frame",
            name: "Foretell",
            splashImageUrl: "https://foretell.one/app.png",
            splashBackgroundColor: "#000000",
          },
        },
      }),
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl: "https://foretell.one/image.png",
        button: {
          title: "Launch Foretell",
          action: {
            type: "launch_miniapp",
            name: "Foretell",
            splashImageUrl: "https://foretell.one/app.png",
            splashBackgroundColor: "#000000",
          },
        },
      }),
    },
  };
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-dvh text-foreground bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <NextAuthProvider>
          <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
            <div className="relative flex flex-col min-h-dvh">
              <Navigation />
              <main className="w-full flex flex-col flex-grow h-full">
                <Suspense>{children}</Suspense>
              </main>
              <Footer />
            </div>
          </Providers>
        </NextAuthProvider>
      </body>
    </html>
  );
}
