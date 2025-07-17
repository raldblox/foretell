import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCollection } from "@/lib/mongodb";
import { Survey } from "@/hooks/useForetell";

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
  const result = await collection.updateOne(
    { surveyId },
    { $push: { responses: response } },
  );

  if (result.modifiedCount === 1) {
    return NextResponse.json({ ok: true });
  } else {
    return NextResponse.json(
      { error: "Survey not found or not updated" },
      { status: 404 },
    );
  }
}
