import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { UpdateFilter, Collection } from "mongodb";

import { getCollection } from "@/lib/mongodb";
import { Survey } from "@/types";

const SurveySchema = z.object({
  surveyId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  createdBy: z.string().min(1),
  createdAt: z.date().or(z.string()),
  expiry: z.string().optional(),
  maxResponses: z.number().int().positive().optional(),
  responses: z.array(z.any()).optional(),
  allowAnonymity: z.boolean().optional(),
  discoverable: z.boolean().optional(),
  chainId: z.string().optional(),
  vaultAddress: z.string().optional(),
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
      { status: 409 }
    );
  }
  await collection.insertOne(survey);

  return NextResponse.json({ ok: true, survey });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { surveyId, chainId, vaultAddress } = body;

  if (!surveyId || !chainId || !vaultAddress) {
    return NextResponse.json(
      { error: "surveyId, chainId, and vaultAddress are required" },
      { status: 400 }
    );
  }

  const collection: Collection<Survey> = await getCollection("surveys");

  const survey = await collection.findOne({ surveyId });

  if (!survey) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  const existingVaultIndex = survey.vaults?.findIndex(
    (vault: any) => vault.chainId === chainId
  );

  let updateQuery: UpdateFilter<Document>;
  if (existingVaultIndex !== undefined && existingVaultIndex !== -1) {
    // Update existing vault
    updateQuery = {
      $set: { [`vaults.${existingVaultIndex}.vaultAddress`]: vaultAddress },
    };
  } else {
    // Add new vault
    updateQuery = {
      $push: { vaults: { chainId, vaultAddress, merkleProof: null } },
    };
  }

  const result = await collection.updateOne({ surveyId }, updateQuery);

  if (result.matchedCount === 0) {
    return NextResponse.json(
      { error: "Failed to update survey" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const surveyId = url.searchParams.get("surveyId");
  const limitParam = url.searchParams.get("limit");
  const offsetParam = url.searchParams.get("offset");

  const collection = await getCollection("surveys");

  // Case 1: Request for a single survey (e.g., from /[surveyId] page)
  // This is identified by the presence of surveyId but NOT pagination params.
  if (surveyId && !limitParam) {
    const survey = await collection.findOne({ surveyId });

    return NextResponse.json({ surveys: survey ? [survey] : [] });
  }

  // Case 2: Request for a paginated list of surveys (e.g., from the main page)
  const limit = parseInt(limitParam || "10", 10);
  const offset = parseInt(offsetParam || "0", 10);
  let surveys = [];
  let mainSurvey = null;

  // If a surveyId is provided, it should be the first item on the first page.
  if (surveyId && offset === 0) {
    mainSurvey = await collection.findOne({ surveyId });
  }

  // Find the rest of the surveys, excluding the main one if it's present.
  const query = surveyId ? { surveyId: { $ne: surveyId } } : {};

  // Adjust limit and offset for the query.
  // If we're including the mainSurvey, we need one less from the rest.
  const adjustedLimit = mainSurvey ? limit - 1 : limit;
  // The offset for the rest of the surveys doesn't need to change.
  const restSurveys = await collection
    .find(query)
    .skip(offset)
    .limit(adjustedLimit > 0 ? adjustedLimit : 0) // ensure limit is not negative
    .toArray();

  if (mainSurvey) {
    surveys = [mainSurvey, ...restSurveys];
  } else {
    surveys = restSurveys;
  }

  return NextResponse.json({ surveys });
}
