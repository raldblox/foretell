"use client";

import { Spacer } from "@heroui/react";
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useContext,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";

import { AppContext } from "./providers";

import { Survey } from "@/hooks/useForetell";
import CreateSurvey from "@/actions/create-survey";
import GetInsight from "@/actions/get-insight";
import { dummySurveys } from "@/lib/dummySurvey";

export default function Home() {
  const searchParams = useSearchParams();
  const surveyIdFromUrl = useRef<string | null>(null);
  const { surveys, setSurveys, idx, setIdx, userId } = useContext(AppContext)!;

  useEffect(() => {
    const invite = searchParams?.get("surveyId");

    if (invite) {
      surveyIdFromUrl.current = invite;
    }
  }, [searchParams]);

  useEffect(() => {
    if (!surveyIdFromUrl.current || !surveys.length) return;
    const idxInList = surveys.findIndex(
      (s: Survey) => s.surveyId === surveyIdFromUrl.current
    );

    if (idxInList > 0) {
      setSurveys((prev: Survey[]) => {
        const found = prev[idxInList];
        const rest = prev.filter((_: Survey, i: number) => i !== idxInList);

        return [found, ...rest];
      });
      setIdx(0);
    }
  }, [surveys.length, setSurveys, setIdx]);

  const currentSurvey = surveys[idx] || dummySurveys[0];

  const prev = () =>
    setIdx((i: number) => (i + surveys.length - 1) % surveys.length);
  const next = () => setIdx((i: number) => (i + 1) % surveys.length);

  // Side navigation state and handlers
  const [hoveredSide, setHoveredSide] = useState<null | "prev" | "next">(null);
  // For prev
  const prevRef = useRef<HTMLDivElement>(null);
  const prevX = useMotionValue(0);
  const prevY = useMotionValue(0);
  // For next
  const nextRef = useRef<HTMLDivElement>(null);
  const nextX = useMotionValue(0);
  const nextY = useMotionValue(0);

  const handlePrevMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prevRef.current) {
      const rect = prevRef.current.getBoundingClientRect();

      prevX.set(e.clientX - rect.left);
      prevY.set(e.clientY - rect.top);
    }
  };
  const handleNextMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (nextRef.current) {
      const rect = nextRef.current.getBoundingClientRect();

      nextX.set(e.clientX - rect.left);
      nextY.set(e.clientY - rect.top);
    }
  };
  const handleMouseEnter = (side: "prev" | "next") => setHoveredSide(side);
  const handleMouseLeave = () => setHoveredSide(null);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <main className="flex flex-col items-center rounded-2xl md:rounded-3xl md:px-0">
        <section className="container mb-12 py-12 z-10 mx-auto max-w-7xl flex flex-col items-center justify-center gap-[18px] p-6">
          {/* <GradientText
            animationSpeed={3}
            className="border-1 border-default-100 px-[18px] py-2 text-small font-normal leading-5 rounded-full"
            colors={["#f31260", "#f5a524", "#17c964", "#f5a524", "#f31260"]}
            showBorder={false}
          >
            ALL IN ONE $FORETELL
          </GradientText> */}

          <div className="flex max-w-2xl flex-col text-center">
            <h1 className="bg-hero-section-title text-4xl md:text-5xl bg-clip-text font-medium text-balance text-transparent dark:from-[#FFFFFF] dark:to-[#ffffff97]">
              Surveys, Markets & Rewards in One Foretell
            </h1>
            <Spacer y={4} />
            <h2 className="text-large text-default-500 text-balance">
              Ask any question, open a live 3-way market, and automatically
              distribute your reward pool—no extra tools required.
            </h2>
            <Spacer y={4} />
            <div className="flex w-full justify-center gap-2">
              <CreateSurvey />
            </div>
          </div>
        </section>

        <div className="z-20 w-[calc(100%-calc(theme(spacing.4)*2))] max-w-6xl ">
          <div className="grid grid-cols-2 opacity-50 border border-default-100 rounded-2xl mb-3 overflow-hidden">
            <div
              className="w-full flex items-center justify-start p-3 hover:bg-default-100"
              role="button"
              tabIndex={0}
              onClick={prev}
            >
              <svg
                height="24"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m8.165 11.63l6.63-6.43C15.21 4.799 16 5.042 16 5.57v12.86c0 .528-.79.771-1.205.37l-6.63-6.43a.5.5 0 0 1 0-.74"
                  fill="currentColor"
                />
              </svg>
              <span>PREV</span>
            </div>
            <div
              className="w-full flex items-center justify-end p-3 hover:bg-default-100"
              role="button"
              tabIndex={0}
              onClick={next}
            >
              <span>NEXT</span>
              <svg
                height="24"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.835 11.63L9.205 5.2C8.79 4.799 8 5.042 8 5.57v12.86c0 .528.79.771 1.205.37l6.63-6.43a.5.5 0 0 0 0-.74"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
          <div className="max-w-7xl rounded-tl-2xl rounded-tr-2xl  bg-default-50/70 backdrop-blur-md mx-auto space-y-8 p-3">
            <Suspense>
              <GetInsight {...currentSurvey} />
            </Suspense>
          </div>
        </div>
        <div className="">
          <div
            ref={prevRef}
            className={`tracking-widest text-sm hover:px-8 border-default-100 transition-all pt-[50vh] md:pt-[50vh] md:p-6 p-3 flex justify-start  z-10 w-[25vw] absolute top-0 left-0 h-full ${hoveredSide === "prev" ? "cursor-none" : "cursor-pointer"}`}
            id="prev"
            role="button"
            tabIndex={0}
            onClick={prev}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") prev();
            }}
            onMouseEnter={() => handleMouseEnter("prev")}
            onMouseLeave={handleMouseLeave}
            onMouseMove={
              hoveredSide === "prev" ? handlePrevMouseMove : undefined
            }
          >
            <AnimatePresence>
              {hoveredSide === "prev" && (
                <motion.span
                  key="prev-cursor"
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center"
                  exit={{ scale: 0.7, opacity: 0 }}
                  initial={{ scale: 0.7, opacity: 0 }}
                  style={{
                    position: "absolute",
                    left: prevX,
                    top: prevY,
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                    fontSize: "1rem",
                    zIndex: 10000,
                    userSelect: "none",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 40,
                    mass: 1,
                    opacity: { duration: 0.15 },
                  }}
                >
                  <svg
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="m8.165 11.63l6.63-6.43C15.21 4.799 16 5.042 16 5.57v12.86c0 .528-.79.771-1.205.37l-6.63-6.43a.5.5 0 0 1 0-.74"
                      fill="currentColor"
                    />
                  </svg>
                  PREV
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div
            ref={nextRef}
            className={`tracking-widest text-sm hover:px-8 border-default-100 transition-all pt-[50vh] md:pt-[50vh] md:p-6 p-3 flex justify-end z-10 w-[25vw] absolute top-0 right-0 h-full ${hoveredSide === "next" ? "cursor-none" : "cursor-pointer"}`}
            id="next"
            role="button"
            tabIndex={0}
            onClick={next}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") next();
            }}
            onMouseEnter={() => handleMouseEnter("next")}
            onMouseLeave={handleMouseLeave}
            onMouseMove={
              hoveredSide === "next" ? handleNextMouseMove : undefined
            }
          >
            <AnimatePresence>
              {hoveredSide === "next" && (
                <motion.span
                  key="next-cursor"
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center"
                  exit={{ scale: 0.7, opacity: 0 }}
                  initial={{ scale: 0.7, opacity: 0 }}
                  style={{
                    position: "absolute",
                    left: nextX,
                    top: nextY,
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                    fontSize: "1rem",
                    zIndex: 10000,
                    userSelect: "none",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 40,
                    mass: 1,
                    opacity: { duration: 0.15 },
                  }}
                >
                  NEXT
                  <svg
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.835 11.63L9.205 5.2C8.79 4.799 8 5.042 8 5.57v12.86c0 .528.79.771 1.205.37l6.63-6.43a.5.5 0 0 0 0-.74"
                      fill="currentColor"
                    />
                  </svg>
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </>
  );
}
