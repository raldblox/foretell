"use client";

import GetInsight from "@/actions/get-insight";
import { AppContext } from "@/app/providers";
import { Survey } from "@/hooks/useForetell";
import { dummySurveys } from "@/lib/dummySurvey";
import { Chip } from "@heroui/react";
import React, { Suspense, useContext, useEffect } from "react";
import { Logo } from "./icons";

export const RenderSurvey = ({ surveyId }: { surveyId: string }) => {
  const { setSurveys, surveys, bertLoaded } = useContext(AppContext);

  useEffect(() => {
    async function getSurvey() {
      if (surveyId) {
        const res = await fetch(`/api/survey?surveyId=${surveyId}`);
        const data = await res.json();
        if (data.surveys) {
          setSurveys(data.surveys);
        }
      }
    }
    getSurvey();
  }, [surveyId, setSurveys]);

  const currentSurvey = surveys[0];

  return (
    <>
      {currentSurvey?.surveyId === surveyId ? (
        <section className="w-full gap-6 z-10 flex flex-col items-center justify-center">
          <div className="flex text-xs items-center border-1 gap-2 rounded-full p-1 w-fit border-default-100">
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
          <div className="z-20 w-full px-3 max-w-6xl">
            <div className="max-w-7xl backdrop-blur-md mx-auto">
              <Suspense>
                <GetInsight {...currentSurvey} />
              </Suspense>
            </div>
          </div>
        </section>
      ) : (
        <section className="w-full flex justify-center animate-pulse items-center absolute top-[45%]">
          <Logo />
        </section>
      )}
    </>
  );
};
