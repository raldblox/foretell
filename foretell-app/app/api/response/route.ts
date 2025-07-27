import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCollection } from "@/lib/mongodb";
import { Survey } from "@/types";

const ResponseSchema = z.object({
  surveyId: z.string().min(1),
  response: z.object({
    uid: z.string(),
    polarity: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
    score: z.number(),
    intensity: z.number(),
    answer: z.string(),
  }),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parse = ResponseSchema.safeParse(body);

  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });
  }
  const { surveyId, response } = parse.data;
  const collection = await getCollection<Survey>("surveys");
  // Fetch the survey to check for existing response
  const survey = await collection.findOne({ surveyId });

  if (!survey) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }
  if (
    survey.responses &&
    survey.responses.some((r: any) => r.uid === response.uid)
  ) {
    return NextResponse.json(
      { error: "You have already submitted a response to this survey." },
      { status: 400 }
    );
  }
  // Check maxResponses
  if (
    survey.maxResponses &&
    survey.responses &&
    survey.responses.length >= survey.maxResponses
  ) {
    return NextResponse.json(
      { error: "This survey has reached the maximum number of responses." },
      { status: 400 }
    );
  }
  // Check expiry
  if (survey.expiry && new Date() > new Date(survey.expiry)) {
    return NextResponse.json(
      { error: "This survey has expired." },
      { status: 400 }
    );
  }
  // Add server-side timestamp
  const responseWithTimestamp = {
    ...response,
    createdAt: new Date().toISOString(),
  };
  const result = await collection.updateOne(
    { surveyId },
    { $push: { responses: responseWithTimestamp } }
  );

  if (result.modifiedCount === 1) {
    return NextResponse.json({ ok: true });
  } else {
    return NextResponse.json(
      { error: "Survey not found or not updated" },
      { status: 404 }
    );
  }
}
