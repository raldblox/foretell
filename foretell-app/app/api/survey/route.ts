import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";

import { getCollection } from "@/lib/mongodb";

const SurveySchema = z.object({
  surveyId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  createdBy: z.string().min(1),
  createdAt: z.date().or(z.string()),
  expiry: z.string().optional(),
  maxResponses: z.number().int().positive().optional(),
  responses: z.array(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  console.log("Received body:", body);
  // Generate a unique surveyId if not provided
  if (!body.surveyId) body.surveyId = nanoid();
  if (!body.createdAt) body.createdAt = new Date().toISOString();

  const parse = SurveySchema.safeParse(body);

  console.log("Zod parse result:", parse);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });
  }
  const survey = parse.data;

  const collection = await getCollection("surveys");
  // Enforce unique surveyId
  const existing = await collection.findOne({ surveyId: survey.surveyId });

  if (existing) {
    return NextResponse.json(
      { error: "Survey with this ID already exists." },
      { status: 409 },
    );
  }
  await collection.insertOne(survey);

  return NextResponse.json({ ok: true, survey });
}

export async function GET() {
  const collection = await getCollection("surveys");
  const surveys = await collection.find({}).toArray();

  return NextResponse.json({ surveys });
}
