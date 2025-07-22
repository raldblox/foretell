"use client";

import GetInsight from "@/actions/get-insight";
import { AppContext } from "@/app/providers";
import { Survey } from "@/hooks/useForetell";
import { dummySurveys } from "@/lib/dummySurvey";
import { Chip } from "@heroui/react";
import React, { useContext, useEffect } from "react";

export const RenderSurvey = ({ surveyId }: { surveyId: string }) => {
  const { setSurveys, surveys, idx, bertLoaded } = useContext(AppContext);

  useEffect(() => {
    async function getSurvey() {
      let url = "/api/survey";

      if (surveyId) {
        url += `?surveyId=${surveyId}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.surveys) {
        setSurveys([...data.surveys]);
      }
    }
    getSurvey();
  }, [surveyId]);

  const currentSurvey = surveys[idx] || dummySurveys[0];
  return (
    <section className="container gap-6 z-10 mx-auto max-w-7xl flex flex-col items-center justify-center px-6">
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
      <GetInsight {...currentSurvey} />
    </section>
  );
};
