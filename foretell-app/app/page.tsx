"use client";

import { Button, cn, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Suspense, useContext, useEffect } from "react";

import { AppContext } from "./providers";

import GradientText from "@/components/GradientText/GradientText";
import Hero from "@/components/hero-section";
import {
  CHANGE_TYPE,
  POLARITY_LABEL,
  POLARITY_VALUES,
  Survey,
} from "@/hooks/useForetell";
import CreateSurvey from "@/actions/create-survey";
import GetInsight from "@/actions/get-insight";

// Remove export from Loader, make it a local component
const Loader = () => {
  return (
    <div className="z-20 mt-12 w-[calc(100%-calc(theme(spacing.4)*2))] max-w-6xl overflow-hidden rounded-tl-2xl rounded-tr-2xl border-1 border-b-0 border-[#FFFFFF1A] bg-default-50/50 backdrop-blur-md bg-opacity-0 p-3">
      <div className="max-w-7xl mx-auto p-3 space-y-8">
        <div className="max-w-7xl mx-auto p-3 space-y-6">
          <section className="md:p-6 p-3 rounded-lg border border-default-200 space-y-4">
            <div className="flex items-start gap-3 justify-between w-full">
              <Skeleton className="w-2/5 rounded-lg">
                <div className="h-6 w-1/3 rounded-lg bg-default-200" />
              </Skeleton>
              <Skeleton className="w-1/5 rounded-lg">
                <div className="h-6 w-[50px] rounded-lg bg-default-200" />
              </Skeleton>
            </div>

            <Skeleton className="w-full rounded-xl">
              <div className="h-[160px] rounded-lg bg-default-200" />
            </Skeleton>
          </section>
          <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {POLARITY_VALUES.map((p, index) => (
              <div
                key={index}
                className=" p-4 flex flex-wrap justify-between hover:bg-default-50 rounded-lg border border-default-200"
              >
                <div>
                  <dt className="text-sm font-medium text-default-500 flex items-center">
                    <Icon
                      className={cn("mr-2", {
                        "text-success": p === 1,
                        "text-warning": p === 0,
                        "text-danger": p === -1,
                      })}
                      icon={
                        CHANGE_TYPE[p] === "positive"
                          ? "ix:emote-happy-filled"
                          : CHANGE_TYPE[p] === "negative"
                            ? "ix:emote-sad-filled"
                            : "ix:emote-neutral-filled"
                      }
                      width={24}
                    />
                    {POLARITY_LABEL[p]}
                  </dt>
                  <dd className="mt-2 text-3xl font-semibold text-default-800">
                    Homies
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export const dummySurvey: Survey = {
  surveyId: "dummy123",
  title: "What is your sentiment about AI in 2024?",
  description: "Share your thoughts on the impact of AI this year.",
  createdBy: "user_abc",
  createdAt: new Date().toISOString(),
  expiry: "2024-12-31T23:59:59Z", // ISO string, optional
  maxResponses: 100, // optional
  responses: [
    {
      uid: "user1",
      polarity: 1,
      score: 0.85,
      intensity: 0.9,
      answer: "AI is making life easier!",
    },
    {
      uid: "user2",
      polarity: -1,
      score: 0.1,
      intensity: 0.8,
      answer: "I'm worried about job loss.",
    },
    {
      uid: "user3",
      polarity: 0,
      score: 0.5,
      intensity: 1,
      answer: "It's a mixed bag.",
    },
  ],
};

export default function Home() {
  const { surveys, setSurveys, idx, setIdx, userId } = useContext(AppContext)!;

  useEffect(() => {
    setSurveys([dummySurvey]);
  }, []);

  if (surveys.length === 0) {
    // show a spinner or hero only on SSR/client first pass
    return (
      <main className="flex flex-col items-center rounded-2xl px-3 md:rounded-3xl md:px-0">
        <Hero />
        <Loader />
      </main>
    );
  }

  const currentSurvey = surveys[idx];

  if (!currentSurvey) {
    return (
      <main className="flex flex-col items-center rounded-2xl px-3 md:rounded-3xl md:px-0">
        <Hero />
        <Loader />
      </main>
    );
  }
  const { title, description, responses } = currentSurvey;

  const prev = () =>
    setIdx((i: number) => (i + surveys.length - 1) % surveys.length);
  const next = () => setIdx((i: number) => (i + 1) % surveys.length);

  return (
    <>
      <main className="flex flex-col items-center rounded-2xl md:rounded-3xl md:px-0">
        <section className="container py-12 z-10 mx-auto max-w-7xl flex flex-col items-center justify-center gap-[18px] p-6">
          <GradientText
            animationSpeed={3}
            className="border-1 border-default-100 px-[18px] py-2 text-small font-normal leading-5 rounded-full"
            colors={["#f31260", "#f5a524", "#17c964", "#f5a524", "#f31260"]}
            showBorder={false}
          >
            ALL IN ONE $FORETELL
          </GradientText>

          <div className="text-center text-[clamp(40px,10vw,44px)] font-bold leading-[1.2] tracking-tighter sm:text-[64px]">
            {/* 
                        NOTE: To use `bg-hero-section-title`, you need to add the following to your tailwind config.
                        ```
                        backgroundImage: {
                          "hero-section-title":
                            "linear-gradient(91deg, #FFF 32.88%, rgba(255, 255, 255, 0.40) 99.12%)",
                        },
                        ```
                      */}
            <div className="bg-hero-section-title bg-clip-text text-balance text-transparent dark:from-[#FFFFFF] dark:to-[#FFFFFF66]">
              Answer Surveys. Stake Predictions. Earn Rewards.
            </div>
          </div>
          <p className="text-center text-default-500 max-w-2xl">
            Foretell brings online surveys, live three-way markets, and
            automated payouts into one seamless platform. Collect any feedback
            (reviews, comments, insights), let your community bet on outcomes,
            and distribute fair rewards—no extra tools required.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row md:p-6 p-3">
            <CreateSurvey />
            <Button
              className="h-10 w-[163px] border-1 border-default-100 px-[16px] py-[10px] text-small font-medium leading-5"
              endContent={
                <span className="pointer-events-none flex h-[22px] w-[22px] items-center justify-center rounded-full bg-default-100">
                  <Icon
                    className="text-default-500 [&>path]:stroke-[1.5]"
                    icon="solar:arrow-right-linear"
                    width={16}
                  />
                </span>
              }
              radius="full"
              variant="bordered"
            >
              See our plans
            </Button>
          </div>
        </section>

        <div className="z-20 md:p-3 w-[calc(100%-calc(theme(spacing.4)*2))] max-w-6xl overflow-hidden rounded-tl-2xl rounded-tr-2xl border-1 border-b-0 border-[#FFFFFF1A] bg-default-50/50 backdrop-blur-md bg-opacity-0">
          <div className="max-w-7xl mx-auto space-y-8 p-3">
            <Suspense fallback={<Loader />}>
              {surveys.length === 0 ? (
                <Loader />
              ) : (
                <GetInsight {...currentSurvey} />
              )}
            </Suspense>
          </div>
        </div>
        <div className="">
          <div
            className="cursor-pointer tracking-widest text-sm hover:px-8 border-default-100 transition-all pt-[75vh] md:pt-[50vh] md:p-6 p-3 flex justify-start hover:bg-gradient-to-l from-transparent to-default-100 z-10 w-[20vw] absolute top-0 left-0 h-full"
            role="button"
            tabIndex={0}
            onClick={prev}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") prev();
            }}
          >
            PREV
          </div>
          <div
            className="cursor-pointer tracking-widest text-sm hover:px-8 border-default-100 transition-all pt-[75vh] md:pt-[50vh] md:p-6 p-3 flex justify-end hover:bg-gradient-to-r from-transparent to-default-100 z-10 w-[20vw] absolute top-0 right-0 h-full"
            role="button"
            tabIndex={0}
            onClick={next}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") next();
            }}
          >
            NEXT
          </div>
        </div>
      </main>
    </>
  );
}
