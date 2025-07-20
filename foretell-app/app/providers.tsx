"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider, useSession } from "next-auth/react";
import { ToastProvider } from "@heroui/react";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { base } from "viem/chains";

import "@farcaster/auth-kit/styles.css";
import { AuthKitProvider } from "@farcaster/auth-kit";
import sdk from "@farcaster/miniapp-sdk";

import { loadTextClassifier } from "@/text-classify";
import { dummySurveys } from "@/lib/dummySurvey";
import { Survey } from "@/hooks/useForetell";

const farcasterConfig = {
  rpcUrl: "https://mainnet.optimism.io",
  domain: "foretell.one",
};

export const AppContext = React.createContext<any | undefined>(undefined);

export const ContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [surveys, setSurveys] = React.useState<Survey[]>(dummySurveys);
  const [idx, setIdx] = React.useState(0);
  const [bertLoaded, setBertLoaded] = React.useState(false);
  const [classifier, setClassifier] = React.useState<any>(null);
  const { data: session } = useSession();

  const [isMiniApp, setIsMiniApp] = React.useState(false);
  const [miniAppFid, setMiniAppFid] = React.useState<string | null>(null);

  const userId = session ? session?.user?.id : miniAppFid;

  React.useEffect(() => {
    (async () => {
      if (typeof window !== "undefined") {
        try {
          const result = await sdk.isInMiniApp();

          setIsMiniApp(result);
          if (result) {
            const context = await sdk.context;

            setMiniAppFid(
              context?.user?.fid ? context.user.fid.toString() : null,
            );
          }
        } catch {}
      }
    })();
  }, []);

  function shuffle(array: any[]) {
    let arr = array.slice();

    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
  }

  React.useEffect(() => {
    async function fetchSurveys() {
      const res = await fetch("/api/survey");

      if (res.ok) {
        const data = await res.json();

        if (data.surveys && data.surveys.length > 0) {
          const now = new Date();
          const filteredSurveys = data.surveys.filter((survey: Survey) => {
            const isDiscoverable = survey.discoverable !== false;
            const isNotExpired =
              !survey.expiry || new Date(survey.expiry) > now;

            return isDiscoverable && isNotExpired;
          });

          setSurveys(() => shuffle([...dummySurveys, ...filteredSurveys]));
        } else {
          setSurveys(shuffle(dummySurveys));
        }
      } else {
        setSurveys(shuffle(dummySurveys));
      }
    }
    fetchSurveys();
  }, []);

  React.useEffect(() => {
    async function loadBert() {
      const classifier = await loadTextClassifier();

      if (classifier) {
        setBertLoaded(true);
        setClassifier(classifier);
      }
    }

    loadBert();
  }, []);

  const value: any = {
    surveys,
    setSurveys,
    idx,
    setIdx,
    userId,
    bertLoaded,
    classifier,
    isMiniApp,
    miniAppFid,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <MiniKitProvider
      apiKey={process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY}
      chain={base}
    >
      <AuthKitProvider config={farcasterConfig}>
        <HeroUIProvider navigate={router.push}>
          <ToastProvider />
          <ContextProvider>
            <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
          </ContextProvider>
        </HeroUIProvider>
      </AuthKitProvider>
    </MiniKitProvider>
  );
}

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
