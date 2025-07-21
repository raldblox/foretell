"use client";

import { Chip, Pagination, Spacer } from "@heroui/react";
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useContext,
  Suspense,
} from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";

import { AppContext } from "./providers";

import { Survey } from "@/hooks/useForetell";
import CreateSurvey from "@/actions/create-survey";
import GetInsight from "@/actions/get-insight";
import { dummySurveys } from "@/lib/dummySurvey";
import { Logo } from "@/components/icons";

export default function Home() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [showHero, setShowHero] = useState(true);
  const { surveys, setSurveys, idx, setIdx, bertLoaded, isMiniApp } =
    useContext(AppContext)!;

  const limit = 10;
  const offsetRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isSwiping, setIsSwiping] = useState(false);

  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 80;

  // Track swipe qualification for popup
  let swipeQualified = false;

  if (isSwiping && touchStart && touchEnd) {
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;

    swipeQualified =
      Math.abs(distanceX) > 2 * Math.abs(distanceY) &&
      Math.abs(distanceX) > minSwipeDistance;
  }

  const fetchSurveys = useCallback(
    async (surveyId?: string, reset = false) => {
      setLoading(true);
      let url = "/api/survey";

      if (surveyId) {
        url += `?surveyId=${surveyId}&limit=${limit}&offset=${reset ? 0 : offsetRef.current}`;
      } else {
        url += `?limit=${limit}&offset=${reset ? 0 : offsetRef.current}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.surveys) {
        setSurveys((prev: Survey[]) => {
          if (reset) return data.surveys;
          // Append only new surveys (no duplicates)
          const newSurveys = data.surveys.filter(
            (s: any) => !prev.some((p) => p.surveyId === s.surveyId)
          );
          return [...prev, ...newSurveys];
        });
        if (reset) setIdx(0); // Only reset idx if we're resetting, not appending
        setHasMore(
          data.surveys.length === limit ||
            (!!surveyId && data.surveys.length > 1)
        );
        offsetRef.current = reset ? limit : offsetRef.current + limit;
      }
      setLoading(false);
    },
    [setSurveys, setIdx]
  );

  // On mount or when surveyId changes:
  useEffect(() => {
    const invite = searchParams?.get("surveyId");

    if (invite) {
      fetchSurveys(invite, true);
      setShowHero(false);
    } else {
      fetchSurveys(undefined, true);
      setShowHero(true);
    }
    if (isMiniApp) {
      setShowHero(false);
    }
  }, [searchParams, pathname]);

  // Auto-fetch more when near the end (last 3)
  useEffect(() => {
    if (!hasMore || loading) return;
    if (surveys.length - idx <= 3) {
      fetchSurveys();
    }
  }, [idx, surveys.length, hasMore, loading]);

  // When URL changes, update idx to match the surveyId in the URL
  useEffect(() => {
    const invite = searchParams?.get("surveyId");
    if (invite && surveys.length > 0) {
      const foundIdx = surveys.findIndex((s: Survey) => s.surveyId === invite);
      if (foundIdx !== -1 && foundIdx !== idx) {
        setIdx(foundIdx);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, surveys]);

  const currentSurvey = surveys[idx] || dummySurveys[0];

  const prev = () =>
    setIdx((i: number) => (i + surveys.length - 1) % surveys.length);
  const next = () => setIdx((i: number) => (i + 1) % surveys.length);

  // Swipe gesture handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
    setIsSwiping(true);
    setHoveredSide(null); // Clear any existing hover effects when starting new touch
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });

    // Sync side navigation hover effects with swipe direction
    if (touchStart) {
      const distanceX = touchStart.x - e.targetTouches[0].clientX;

      if (Math.abs(distanceX) > 20) {
        // Threshold to trigger hover effect
        if (distanceX > 0) {
          // Swiping left - show next hover effect
          setHoveredSide("next");
        } else {
          // Swiping right - show prev hover effect
          setHoveredSide("prev");
        }
      }
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > 2 * Math.abs(distanceY);

    if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) {
        // Swipe left - go to next
        next();
      } else {
        // Swipe right - go to prev
        prev();
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
    setHoveredSide(null); // Clear hover effect when swipe ends
  };

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

  const isLoadingSurvey = surveys.length === 0;

  return (
    <>
      <main
        className="flex flex-col h-full items-center rounded-2xl md:rounded-3xl md:px-0"
        style={{ touchAction: "pan-y" }} // Allow vertical scrolling but handle horizontal swipes
        onTouchEnd={onTouchEnd}
        onTouchMove={onTouchMove}
        onTouchStart={onTouchStart}
      >
        {isLoadingSurvey ? (
          <>
            <div className="w-full flex justify-center items-center absolute top-[45%]">
              <Logo />
            </div>
          </>
        ) : (
          <>
            <div className="flex text-xs items-center border-1 gap-2 rounded-full mt-3 mb-6 p-1 border-default-100">
              <span className="pl-3 font-semibold">AI Sentiment Analyzer</span>
              <Chip
                className={`text-xs border-1 p-1 ${bertLoaded ? "text-success" : "text-warning"}`}
                color={bertLoaded ? "success" : "warning"}
                radius="full"
                variant="dot"
              >
                {bertLoaded ? "Running on CPU" : "Loading"}
              </Chip>
            </div>
            {showHero && (
              <section
                className="container py-6 mb-8 z-10 mx-auto max-w-7xl flex flex-col items-center justify-center gap-[18px] p-6"
                id="hero"
              >
                <div className="flex max-w-2xl flex-col text-center">
                  <h1 className="bg-hero-section-title text-4xl md:text-5xl bg-clip-text font-medium text-balance text-transparent dark:from-[#FFFFFF] dark:to-[#ffffffcd]">
                    Surveys, Markets & Rewards in One Foretell
                  </h1>
                  <Spacer y={4} />
                  <h2 className="text-large text-default-500 text-balance">
                    Ask any question, open a live 3-way market, and
                    automatically distribute your reward pool—no extra tools
                    required.
                  </h2>
                  <Spacer y={4} />
                  <div className="flex w-full justify-center gap-2">
                    <CreateSurvey />
                  </div>
                </div>
              </section>
            )}

            <div className="z-20 w-full px-3 max-w-6xl">
              <div className="mx-auto w-fit p-3">
                <Pagination
                  color="secondary"
                  showControls
                  page={idx}
                  variant="light"
                  total={surveys.length}
                  onChange={setIdx}
                  loop={true}
                />
              </div>

              {/* Swipe indicator for mobile */}
              {swipeQualified && touchStart && touchEnd && (
                <motion.div
                  animate={{ opacity: 1 }}
                  className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                >
                  <div className="bg-foreground backdrop-blur-sm rounded-full px-4 p-2 text-background text-sm font-medium">
                    {touchStart.x - touchEnd.x > 0 ? (
                      <div className="flex items-center pr-4">
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
                        <span>NEXT</span>
                      </div>
                    ) : (
                      <div className="flex items-center pl-4">
                        <span>PREV</span>
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
                    )}
                  </div>
                </motion.div>
              )}

              <motion.div
                animate={{
                  x:
                    isSwiping && touchStart && touchEnd
                      ? (touchEnd.x - touchStart.x) * 0.1
                      : 0,
                }}
                className="max-w-7xl rounded-tl-2xl rounded-tr-2xl bg-default-50/50 backdrop-blur-md mx-auto p-3"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Suspense>
                  <GetInsight {...currentSurvey} />
                </Suspense>
              </motion.div>
            </div>

            <div className="">
              <div
                ref={prevRef}
                className={`tracking-widest text-sm hover:px-8 border-default-100 transition-all pt-[50vh] md:pt-[50vh] md:p-6 p-3 flex justify-start z-10 w-[30vw] absolute top-0 left-0 h-full ${hoveredSide === "prev" ? "cursor-none" : "cursor-pointer"}`}
                id="prev"
                role="button"
                style={{ background: "transparent" }}
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
                <motion.div
                  animate={{ opacity: hoveredSide === "prev" ? 1 : 0 }}
                  initial={{ opacity: 0 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    background:
                      "linear-gradient(to left, transparent, #be123c50)",
                    zIndex: 0,
                  }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                />
                <AnimatePresence>
                  {hoveredSide === "prev" && (
                    <motion.span
                      key="prev-cursor"
                      animate={{ scale: 1, opacity: 1 }}
                      className="hidden md:flex items-center"
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
                className={`tracking-widest text-sm hover:px-8 border-default-100 transition-all pt-[50vh] md:pt-[50vh] md:p-6 p-3 flex justify-end z-10 w-[30vw] absolute top-0 right-0 h-full ${hoveredSide === "next" ? "cursor-none" : "cursor-pointer"}`}
                id="next"
                role="button"
                style={{ background: "transparent" }}
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
                <motion.div
                  animate={{ opacity: hoveredSide === "next" ? 1 : 0 }}
                  initial={{ opacity: 0 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    background:
                      "linear-gradient(to right, transparent, #22c55e50)",
                    zIndex: 0,
                  }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                />
                <AnimatePresence>
                  {hoveredSide === "next" && (
                    <motion.span
                      key="next-cursor"
                      animate={{ scale: 1, opacity: 1 }}
                      className="hidden md:flex items-center"
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
          </>
        )}
      </main>
    </>
  );
}
