"use client";

import GradientText from "@/components/GradientText/GradientText";
import Hero from "@/components/hero-section";
import Insight from "@/components/insight";
import {
  CHANGE_TYPE,
  POLARITY_LABEL,
  POLARITY_VALUES,
  UserRaw,
} from "@/hooks/useForetell";
import {
  Button,
  cn,
  Divider,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Skeleton,
  Spinner,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Suspense, useEffect, useMemo, useState } from "react";

export default function Home() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [surveys, setSurveys] = useState<
    {
      question: string;
      totalPool: number;
      data: UserRaw[];
    }[]
  >([]);

  // NEW: form state
  const [newQuestion, setNewQuestion] = useState("");
  const [newPool, setNewPool] = useState(100);
  const [newSampleCount, setNewSampleCount] = useState(50);

  useEffect(() => {
    // Build on the client only
    function makeDummy(n: number, offset = 0): UserRaw[] {
      return Array.from({ length: n }, (_, i) => ({
        uid: `U${offset + i + 1}`,
        polarity: (Math.floor(Math.random() * 3) - 1) as -1 | 0 | 1,
        score: parseFloat(Math.random().toFixed(2)),
      }));
    }

    setSurveys([
      { question: "New UI redesign?", totalPool: 100, data: makeDummy(50, 0) },
      {
        question: "Next product launch success?",
        totalPool: 200,
        data: makeDummy(80, 50),
      },
      {
        question: "Favorite project meme?",
        totalPool: 150,
        data: makeDummy(60, 130),
      },
    ]);
  }, []);

  const [idx, setIdx] = useState(0);

  if (surveys.length === 0) {
    // show a spinner or hero only on SSR/client first pass
    return (
      <main className="flex flex-col items-center rounded-2xl px-3 md:rounded-3xl md:px-0">
        <Hero />
        <Loader />
      </main>
    );
  }

  const { question, totalPool, data } = surveys[idx];
  const prev = () => setIdx((i) => (i + surveys.length - 1) % surveys.length);
  const next = () => setIdx((i) => (i + 1) % surveys.length);

  return (
    <>
      <main className="flex flex-col items-center rounded-2xl px-3 md:rounded-3xl md:px-0">
        <section className="container z-10 mx-auto max-w-7xl my-14 flex flex-col items-center justify-center gap-[18px] sm:gap-6">
          <GradientText
            colors={["#feff94", "#e8ffc1", "#9ef5cf", "#51dacf", "#0278ae"]}
            animationSpeed={2}
            showBorder={false}
            className="border-1 border-default-100 px-[18px] py-2 text-small font-normal leading-5 rounded-full"
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
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
            <Button
              className="h-10 w-[163px] bg-default-foreground px-[16px] py-[10px] text-small font-medium leading-5 text-background"
              radius="full"
              onPress={onOpen}
            >
              Create Survey
            </Button>
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

        <div className="z-20 mt-12 w-[calc(100%-calc(theme(spacing.4)*2))] max-w-6xl overflow-hidden rounded-tl-2xl rounded-tr-2xl border-1 border-b-0 border-[#FFFFFF1A] bg-default-50/50 backdrop-blur-md bg-opacity-0 p-3">
          <div className="max-w-7xl mx-auto p-3 space-y-8">
            <Suspense fallback={<Loader />}>
              <Insight question={question} totalPool={totalPool} data={data} />
            </Suspense>
          </div>
        </div>
        <div className="">
          <div
            role="button"
            onClick={prev}
            className="transition-all cursor-pointer border-default-100 border-r border-dashed pt-[50vh] p-6 flex justify-start hover:bg-default-50 z-10 w-[20vw] absolute top-0 left-0 h-full"
          >
            PREV
          </div>
          <div
            role="button"
            onClick={next}
            className="transition-all cursor-pointer border-default-100 border-l border-dashed pt-[50vh] p-6 flex justify-end hover:bg-default-50 z-10 w-[20vw] absolute top-0 right-0 h-full"
          >
            NEXT
          </div>
        </div>
      </main>
      <Modal
        isOpen={isOpen}
        shouldBlockScroll={false}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(close) => (
            <ModalBody>
              <ModalHeader className="flex-col items-center gap-1 px-0 text-center">
                <h2 className="text-xl font-semibold">Create New Survey</h2>
                <p className="text-sm text-default-500">
                  Define your question, total reward pool, and sample size.
                </p>
              </ModalHeader>

              <form
                className="flex w-full flex-col gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  // client-only dummy generator
                  function makeDummy(n: number, offset = 0): UserRaw[] {
                    return Array.from({ length: n }, (_, i) => ({
                      uid: `U${offset + i + 1}`,
                      polarity: (Math.floor(Math.random() * 3) - 1) as
                        | -1
                        | 0
                        | 1,
                      score: parseFloat(Math.random().toFixed(2)),
                    }));
                  }

                  const offset = surveys.reduce(
                    (sum, s) => sum + s.data.length,
                    0
                  );
                  const newData = makeDummy(newSampleCount, offset);

                  setSurveys([
                    ...surveys,
                    {
                      question: newQuestion,
                      totalPool: newPool,
                      data: newData,
                    },
                  ]);

                  setIdx(surveys.length);
                  setNewQuestion("");
                  setNewPool(100);
                  setNewSampleCount(50);
                  close();
                }}
              >
                <Textarea
                  label="Topic"
                  value={newQuestion}
                  onValueChange={setNewQuestion}
                  required
                  placeholder="e.g. What do you think of our redesign?"
                />

                <Input
                  type="number"
                  label="Total Reward Pool"
                  value={String(newPool)}
                  onValueChange={(v) => setNewPool(Number(v))}
                  required
                  min={1}
                />

                <Input
                  type="number"
                  label="Sample Size"
                  value={String(newSampleCount)}
                  onValueChange={(v) => setNewSampleCount(Number(v))}
                  required
                  min={1}
                />
                <Divider className="my-2" />
                <div className="flex justify-end gap-2 pb-4">
                  <Button variant="flat" color="danger" onPress={close}>
                    Cancel
                  </Button>
                  <Button type="submit" color="primary">
                    Create
                  </Button>
                </div>
              </form>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export const Loader = () => {
  return (
    <div className="z-20 mt-12 w-[calc(100%-calc(theme(spacing.4)*2))] max-w-6xl overflow-hidden rounded-tl-2xl rounded-tr-2xl border-1 border-b-0 border-[#FFFFFF1A] bg-default-50/50 backdrop-blur-md bg-opacity-0 p-3">
      <div className="max-w-7xl mx-auto p-3 space-y-8">
        <div className="max-w-7xl mx-auto p-3 space-y-6">
          <section className="p-6 rounded-lg border border-default-200 space-y-4">
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
                      width={24}
                      icon={
                        CHANGE_TYPE[p] === "positive"
                          ? "ix:emote-happy-filled"
                          : CHANGE_TYPE[p] === "negative"
                            ? "ix:emote-sad-filled"
                            : "ix:emote-neutral-filled"
                      }
                      className={cn("mr-2", {
                        "text-success": p === 1,
                        "text-warning": p === 0,
                        "text-danger": p === -1,
                      })}
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
