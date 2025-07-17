"use client";

import type { TextAreaProps } from "@heroui/react";

import React, { useContext } from "react";
import { Button, Textarea } from "@heroui/react";
import { cn } from "@heroui/react";
import { Icon } from "@iconify/react";

import { AppContext } from "@/app/providers";
import { loadTextClassifier } from "@/model/text-classify";
import { Survey } from "@/hooks/useForetell";

const PromptInput = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ classNames = {}, ...props }, ref) => {
    return (
      <Textarea
        ref={ref}
        aria-label="Prompt"
        className="min-h-[40px] p-3"
        classNames={{
          ...classNames,
          label: cn("hidden", classNames?.label),
          input: cn("py-0", classNames?.input),
        }}
        minRows={1}
        placeholder="Your thoughts here..."
        radius="sm"
        variant="bordered"
        {...props}
      />
    );
  }
);

PromptInput.displayName = "PromptInput";

interface ResponseProps {
  idx?: number;
}

const SubmitResponse = ({ idx: propIdx }: ResponseProps) => {
  const {
    surveys,
    setSurveys,
    idx: contextIdx,
    userId,
    setIdx,
  } = useContext(AppContext)!;
  const idx = propIdx !== undefined ? propIdx : contextIdx;
  const [response, setResponse] = React.useState<string>("");

  const submitResponse = async () => {
    if (!response.trim()) return;
    if (!userId) {
      alert("You must be logged in to submit a response.");

      return;
    }
    const classifier = await loadTextClassifier();

    if (!classifier) {
      console.error("Text classifier failed to load");

      return;
    }

    const result = await classifier.classify(response);

    console.log("Classification result:", result);

    // Use both positive and negative scores to derive a continuous score
    const categories = result.classifications?.[0]?.categories || [];
    const positive = categories.find(
      (c) => c.categoryName?.toLowerCase() === "positive"
    );
    const negative = categories.find(
      (c) => c.categoryName?.toLowerCase() === "negative"
    );

    let score = 0.5;

    if (positive) {
      score = positive.score;
    } else if (negative) {
      score = 1 - negative.score;
    }

    // Define neutral range
    let polarity: -1 | 0 | 1 = 0;

    if (score > 0.7) polarity = 1;
    else if (score < 0.3) polarity = -1;
    else polarity = 0;

    let intensity = 0;

    if (polarity === -1) {
      // Negative: 1 at 0, 0 at 0.3
      intensity = 1 - Math.min(Math.max(score / 0.3, 0), 1);
    } else if (polarity === 0) {
      // Neutral: 1 at 0.5, 0 at 0.3 or 0.7
      intensity = 1 - Math.min(Math.abs(score - 0.5) / 0.2, 1);
    } else if (polarity === 1) {
      // Positive: 0 at 0.7, 1 at 1
      intensity = Math.min(Math.max((score - 0.7) / 0.3, 0), 1);
    }
    // Create RawEntry
    const RawEntry = {
      uid: userId,
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
        if (idx + 1 < (data.surveys?.length || 0)) {
          setIdx(idx + 1);
        } else {
          setIdx(0);
        }
      }
      setResponse("");
    } else {
      const data = await res.json();

      alert(data.error || "Failed to submit response");
    }
  };

  return (
    <form className="flex w-full flex-col items-start rounded-md bg-default-50 transition-colors">
      <PromptInput
        classNames={{
          inputWrapper: "!bg-transparent shadow-none",
          innerWrapper: "relative",
          input: "pt-1 pl-2 pb-6 !pr-10 text-medium",
        }}
        endContent={
          <div className="flex items-end gap-2">
            <Button
              isIconOnly
              color={!response ? "default" : "primary"}
              isDisabled={!response}
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
        minRows={3}
        radius="lg"
        value={response}
        variant="flat"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitResponse();
          }
        }}
        onValueChange={setResponse}
      />
      <div className="flex w-full flex-wrap items-center justify-between gap-2 px-4 pb-4">
        <div className="flex flex-wrap gap-3">
          <Button
            size="sm"
            startContent={
              <Icon
                className="text-default-500"
                icon="solar:paperclip-linear"
                width={18}
              />
            }
            variant="flat"
          >
            Add stake
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
  );
};

export default SubmitResponse;
