import { ImageResponse } from "next/og";

import { getCollection } from "@/lib/mongodb";

const size = {
  width: 1024,
  height: 683,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const surveyId = searchParams.get("surveyId");
  let title: string | null = null;

  if (surveyId) {
    try {
      const collection = await getCollection("surveys");
      const survey = await collection.findOne({ surveyId });

      if (survey && survey.title) {
        title = survey.title;
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (title) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: "black",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          {title}
        </div>
      ),
      {
        ...size,
      },
    );
  } else {
    // Always use a text fallback, never <img>
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: "black",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          Foretell
        </div>
      ),
      { ...size },
    );
  }
}
