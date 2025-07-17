"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider, useSession } from "next-auth/react";

import { UserRaw } from "@/hooks/useForetell";

export const AppContext = React.createContext<any | undefined>(undefined);

export const ContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [surveys, setSurveys] = React.useState<
    {
      question: string;
      totalPool: number;
      data: UserRaw[];
    }[]
  >([]);

  const [idx, setIdx] = React.useState(0);
  const { data: session } = useSession();
  const userId = session?.user?.id;

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
      <ContextProvider>
        <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
      </ContextProvider>
    </HeroUIProvider>
  );
}

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
