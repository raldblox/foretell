import { ImageResponse } from "next/og";
import { getCollection } from "@/lib/mongodb";
import React from "react";
import { join } from "node:path";
import { readFile } from "node:fs/promises";

export const alt = "Foretell Survey";
export const size = {
  width: 1024,
  height: 683,
};
export const contentType = "image/png";

async function getImageDataUrl() {
  const imagePath = join(process.cwd(), "public", "image.png");
  const imageBuffer = await readFile(imagePath);
  const base64 = imageBuffer.toString("base64");
  return `data:image/png;base64,${base64}`;
}

export default async function Image({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = (await searchParams) ?? {};
  const surveyId = typeof params.surveyId === "string" ? params.surveyId : undefined;

  let title: string | null = null;
  if (surveyId) {
    try {
      const collection = await getCollection("surveys");
      const survey = await collection.findOne({ surveyId });
      if (survey && survey.title) {
        title = survey.title;
      }
    } catch (e) {
      // fallback to image
    }
  }

  if (title) {
    return new ImageResponse(
      <div
        style={{
          fontSize: 48,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {title}
      </div>,
      {
        ...size,
      }
    );
  } else {
    const logoSrc = await getImageDataUrl();
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "white",
        }}
      >
        <img src={logoSrc} height={size.height} />
      </div>,
      {
        ...size,
      }
    );
  }
}
