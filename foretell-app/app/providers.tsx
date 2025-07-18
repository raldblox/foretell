"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider, useSession } from "next-auth/react";
import { ToastProvider } from "@heroui/react";

import { Survey } from "@/hooks/useForetell";
import { dummySurveys } from "@/lib/dummySurvey";

export const AppContext = React.createContext<any | undefined>(undefined);

export const ContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [surveys, setSurveys] = React.useState<Survey[]>(dummySurveys);
  const [idx, setIdx] = React.useState(0);
  const { data: session } = useSession();
  const userId = session?.user?.id;

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
          setSurveys((prev) => shuffle([...dummySurveys, ...data.surveys]));
        } else {
          setSurveys(shuffle(dummySurveys));
        }
      } else {
        setSurveys(shuffle(dummySurveys));
      }
    }
    fetchSurveys();
  }, []);

  const value: any = { surveys, setSurveys, idx, setIdx, userId };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
// --- End Custom App Context ---

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
    <HeroUIProvider navigate={router.push}>
      <ToastProvider />
      <ContextProvider>
        <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
      </ContextProvider>
    </HeroUIProvider>
  );
}

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
