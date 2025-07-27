"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider, useSession } from "next-auth/react";
import { ToastProvider } from "@heroui/react";
import "@farcaster/auth-kit/styles.css";
import { AuthKitProvider } from "@farcaster/auth-kit";
import sdk from "@farcaster/miniapp-sdk";
import { loadTextClassifier } from "@/model/text-classify";
import { dummySurveys } from "@/lib/dummySurvey";
import { Survey } from "@/types";
import { SequenceConnect, createConfig } from "@0xsequence/connect";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

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

  // checks
  React.useEffect(() => {
    (async () => {
      if (typeof window !== "undefined") {
        try {
          const result = await sdk.isInMiniApp();

          setIsMiniApp(result);
          if (result) {
            const context = await sdk.context;

            setMiniAppFid(
              context?.user?.fid ? context.user.fid.toString() : null
            );
          }
        } catch {}
      }
    })();
  }, []);

  // load model wasm
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

  // display miniapp if farcaster
  React.useEffect(() => {
    async function displayMiniApp() {
      await sdk.actions.ready();
    }
    if (isMiniApp && surveys.length >= 1) {
      displayMiniApp();
    }
  }, [surveys]);

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
    setIsMiniApp,
    setMiniAppFid,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  // sequence config
  const projectAccessKey = process.env.SEQUENCE_PROJECT_KEY!;
  const waasConfigKey = process.env.SEQUENCE_WAAS_KEY!;
  
  const config = createConfig("waas", {
    projectAccessKey,
    position: "center",
    defaultTheme: "dark",
    signIn: {
      projectName: "Foretell",
    },
    defaultChainId: 128123,
    chainIds: [42793, 128123],
    appName: "Foretell",
    waasConfigKey,
    google: false,
    apple: false,
    walletConnect: false,
    coinbase: false,
    metaMask: false,
    wagmiConfig: {
      multiInjectedProviderDiscovery: true,
    },
    enableConfirmationModal: true,
  });

  return (
    <AuthKitProvider config={farcasterConfig}>
      <SequenceConnect config={config}>
        <HeroUIProvider navigate={router.push}>
          <ToastProvider />
          <ContextProvider>
            <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
          </ContextProvider>
        </HeroUIProvider>
      </SequenceConnect>
    </AuthKitProvider>
  );
}

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
