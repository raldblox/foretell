"use client";

import React, { useContext } from "react";
import { addToast, Alert, Button, Textarea } from "@heroui/react";
import { cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRef } from "react";

import { AppContext } from "@/app/providers";
import { Survey } from "@/hooks/useForetell";

interface ResponseProps {
  idx?: number;
}

// Utility to compute sentiment analysis (polarity, intensity, score)
export function getSentimentAnalysis(
  classifier: any,
  text: string
): Promise<{ polarity: -1 | 0 | 1; intensity: number; score: number }> {
  return new Promise(async (resolve) => {
    if (!classifier || !text) {
      resolve({ polarity: 0, intensity: 0, score: 0.5 });
      return;
    }
    const result = await classifier.classify(text);
    const categories = result.classifications?.[0]?.categories || [];
    const positive = categories.find(
      (c: any) => c.categoryName?.toLowerCase() === "positive"
    );
    const negative = categories.find(
      (c: any) => c.categoryName?.toLowerCase() === "negative"
    );
    let score = 0.5;
    if (positive) {
      score = positive.score;
    } else if (negative) {
      score = 1 - negative.score;
    }
    let polarity: -1 | 0 | 1 = 0;
    if (score > 0.8) polarity = 1;
    else if (score < 0.2) polarity = -1;
    else polarity = 0;
    let intensity = 0;
    if (polarity === -1) {
      intensity = 1 - Math.min(Math.max(score / 0.3, 0), 1);
    } else if (polarity === 0) {
      intensity = 1 - Math.min(Math.abs(score - 0.5) / 0.2, 1);
    } else if (polarity === 1) {
      intensity = Math.min(Math.max((score - 0.7) / 0.3, 0), 1);
    }
    resolve({ polarity, intensity, score });
  });
}

const SubmitResponse = ({ idx: propIdx }: ResponseProps) => {
  const {
    surveys,
    setSurveys,
    idx: contextIdx,
    userId,
    setIdx,
    classifier,
  } = useContext(AppContext)!;
  const idx = propIdx !== undefined ? propIdx : contextIdx;
  const [response, setResponse] = React.useState<string>("");
  const [liveAnalysis, setLiveAnalysis] = React.useState(false);
  const [livePolarity, setLivePolarity] = React.useState<null | -1 | 0 | 1>(0);
  const [liveIntensity, setLiveIntensity] = React.useState<number>(0);
  const analysisTimeout = useRef<NodeJS.Timeout | null>(null);
  const analysisInProgress = useRef(false);

  const currentSurvey = surveys[idx];
  const hasResponded = currentSurvey?.responses?.some(
    (r: any) => r.uid === userId
  );
  const isExpired =
    currentSurvey?.expiry && new Date() > new Date(currentSurvey.expiry);
  const isFull =
    currentSurvey?.maxResponses &&
    currentSurvey.responses &&
    currentSurvey.responses.length >= currentSurvey.maxResponses;

  // Handle anonymous UID
  let anonUid = null;

  // DEV MODE: always generate a new anon UID to allow repeated submissions
  const isDev =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_ENV === "dev";

  if (typeof window !== "undefined" && currentSurvey?.allowAnonymity) {
    if (isDev) {
      anonUid = `anon#${Math.random().toString(36).slice(2, 10)}`;
    } else {
      anonUid = localStorage.getItem(`anonUid_${currentSurvey.surveyId}`);
      if (!anonUid) {
        anonUid = `anon#${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem(`anonUid_${currentSurvey.surveyId}`, anonUid);
      }
    }
  }

  // Live sentiment analysis as user types
  React.useEffect(() => {
    if (!response) {
      setLivePolarity(0);
      setLiveIntensity(0);
      return;
    }
    if (!classifier || !liveAnalysis) {
      setLivePolarity(0);
      setLiveIntensity(0);
      return;
    }
    if (analysisTimeout.current) {
      clearTimeout(analysisTimeout.current);
    }
    analysisTimeout.current = setTimeout(async () => {
      if (!classifier || !liveAnalysis || !response) return;
      if (analysisInProgress.current) return;
      analysisInProgress.current = true;
      try {
        const { polarity, intensity } = await getSentimentAnalysis(
          classifier,
          response
        );
        setLivePolarity(polarity);
        setLiveIntensity(intensity);
      } finally {
        analysisInProgress.current = false;
      }
    }, 300);
    return () => {
      if (analysisTimeout.current) {
        clearTimeout(analysisTimeout.current);
      }
    };
  }, [response, classifier, liveAnalysis]);

  const submitResponse = async () => {
    if (!response.trim()) return;
    if (!userId && !currentSurvey?.allowAnonymity) {
      alert("You must be logged in to submit a response.");

      return;
    }
    if (hasResponded && !(isDev && currentSurvey?.allowAnonymity)) {
      alert("You have already submitted a response to this survey.");

      return;
    }
    if (isExpired) {
      alert("This survey has expired.");

      return;
    }
    if (isFull) {
      alert("This survey has reached the maximum number of responses.");

      return;
    }

    if (!classifier) {
      console.error("Text classifier failed to load");

      return;
    }

    const { polarity, intensity, score } = await getSentimentAnalysis(
      classifier,
      response
    );
    // Create RawEntry
    const RawEntry = {
      uid: currentSurvey?.allowAnonymity ? anonUid : userId,
      polarity,
      score,
      intensity,
      answer: response,
    };
    console.log(RawEntry);
    // Get the current surveyId
    const surveyId = surveys[idx]?.surveyId;

    if (!surveyId) return;
    // POST to API
    const res = await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ surveyId, response: RawEntry }),
    });

    if (res.ok) {
      // Optionally, re-fetch surveys or update context
      const updated = await fetch("/api/survey");

      if (updated.ok) {
        const data = await updated.json();

        addToast({
          title: "Your response has been recorded.",
          color: "success",
        });

        // Optimistically add the new response to the corresponding survey
        setSurveys((prev: Survey[]) => {
          const newSurveys = prev.map((survey: Survey, i: number) => {
            if (i === idx) {
              return {
                ...survey,
                responses: [...(survey.responses || []), RawEntry],
              };
            }

            return survey;
          });

          return newSurveys;
        });
        // After updating, check if there is a next survey
        // if (idx + 1 < (data.surveys?.length || 0)) {
        //   setIdx(idx + 1);
        // } else {
        //   setIdx(0);
        // }
      }
      setResponse("");
      setLivePolarity(0);
      setLiveIntensity(0);
    } else {
      const data = await res.json();

      addToast({
        title: "Failed to submit response.",
        description: data.error,
        color: "danger",
      });
    }
  };

  return (
    <>
      <form className="flex w-full flex-col  items-start rounded-md bg-default-50 transition-colors">
        <Textarea
          aria-label="Prompt"
          classNames={{
            inputWrapper: "!bg-transparent min-h-[275px] shadow-none",
            innerWrapper: "relative",
            input: "p-3 md:p-6 text-medium",
          }}
          disabled={hasResponded || isExpired || isFull}
          endContent={
            <div className="flex items-end ml-6">
              <Button
                isIconOnly
                color={!response ? "default" : "primary"}
                isDisabled={!response || hasResponded || isExpired || isFull}
                radius="lg"
                size="lg"
                variant="solid"
                onPress={submitResponse}
              >
                <Icon
                  className={cn(
                    "[&>path]:stroke-[2px]",
                    !response ? "text-default-600" : "text-primary-foreground"
                  )}
                  icon="solar:arrow-up-linear"
                  width={20}
                />
              </Button>
            </div>
          }
          minRows={1}
          placeholder="Respond here..."
          radius="sm"
          value={response}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submitResponse();
            }
          }}
          onValueChange={setResponse}
        />
        <div className="flex w-full flex-wrap border-t border-default-100 items-center justify-between gap-2 p-3">
          <div className="flex flex-wrap gap-3">
            <Button
              isDisabled={false}
              size="sm"
              variant="flat"
              className="p-0.5 px-2"
              startContent={
                <Icon
                  className={liveAnalysis ? "text-success" : "text-default-500"}
                  icon={
                    liveAnalysis
                      ? "svg-spinners:gooey-balls-1"
                      : "octicon:dot-fill-16"
                  }
                  width={18}
                />
              }
              onPress={() => setLiveAnalysis((v) => !v)}
            >
              Live Analyzer
              <div className="flex text-xs items-center px-2 py-0.5 gap-3 rounded-lg bg-default-50 border border-default-200">
                <span
                  className={
                    livePolarity === 1
                      ? "text-success"
                      : livePolarity === 0
                        ? "text-foreground"
                        : livePolarity === -1
                          ? "text-danger"
                          : ""
                  }
                >
                  {liveAnalysis ? (
                    <>
                      {liveIntensity !== null ? liveIntensity.toFixed(3) : "-"}
                    </>
                  ) : (
                    <>OFF</>
                  )}
                </span>
              </div>
            </Button>
            {/* <Button
            size="sm"
            startContent={
              <Icon
                className="text-default-500"
                icon="solar:soundwave-linear"
                width={18}
              />
            }
            variant="flat"
          >
            Voice Commands
          </Button>
          <Button
            size="sm"
            startContent={
              <Icon
                className="text-default-500"
                icon="solar:notes-linear"
                width={18}
              />
            }
            variant="flat"
          >
            Templates
          </Button> */}
          </div>

          <p className="py-1 text-tiny text-default-400">
            {response.length}/2000
          </p>
        </div>
      </form>

      {(hasResponded || isExpired || isFull) && (
        <Alert color="warning">
          {hasResponded
            ? "You have already submitted a response to this survey."
            : isExpired
              ? "This survey has expired."
              : isFull
                ? "This survey has reached the maximum number of responses."
                : null}
        </Alert>
      )}

      {currentSurvey?.allowAnonymity && (
        <Alert
          color="default"
          icon={<Icon height="24" icon="hugeicons:anonymous" width="24" />}
        >
          Anonymous response is allowed
        </Alert>
      )}
    </>
  );
};

export default SubmitResponse;
