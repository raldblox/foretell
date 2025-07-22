import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { Suspense } from "react";

import { Providers, NextAuthProvider } from "./providers";

import { fontSans } from "@/config/fonts";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export const generateMetadata = (): Metadata => {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  return {
    title: "Foretell",
    description: "It's foretelling time!",
    openGraph: {
      images: [`${baseUrl}/api/og`],
    },
    metadataBase: new URL(baseUrl),
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
            <div className="relative flex flex-col min-h-dvh w-screen">
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
