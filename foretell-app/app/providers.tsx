"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { UserRaw } from "@/hooks/useForetell";

export interface AppContextType {
  surveys: {
    question: string;
    totalPool: number;
    data: UserRaw[];
  }[];
  setSurveys: React.Dispatch<
    React.SetStateAction<
      {
        question: string;
        totalPool: number;
        data: UserRaw[];
      }[]
    >
  >;
  idx: number;
  setIdx: React.Dispatch<React.SetStateAction<number>>;
}

export const AppContext = React.createContext<AppContextType | undefined>(
  undefined,
);

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

  const value: AppContextType = { surveys, setSurveys, idx, setIdx };

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
