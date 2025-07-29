import { Metadata } from "next";
import { RenderSurvey } from "@/components/visualize/render-survey";
import { AsyncProps } from "@/types";
import MerkleRootUpdater from "@/components/merkle-root-updater";

export async function generateMetadata({
  params,
}: AsyncProps): Promise<Metadata> {
  const { surveyId } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  let ogUrl = `${baseUrl}/api/og`;

  if (surveyId) {
    ogUrl = `${baseUrl}/api/og?surveyId=${encodeURIComponent(surveyId as string)}`;
  }

  return {
    title: "Foretell",
    description: "It's foretelling time!",
    openGraph: {
      images: [ogUrl],
    },
    metadataBase: new URL(baseUrl),
    other: {
      "fc:frame": JSON.stringify({
        version: "1",
        imageUrl: "https://foretell.one/image.png",
        button: {
          title: "Launch Foretell",
          action: {
            type: "launch_frame",
            name: "Foretell",
            splashImageUrl: "https://foretell.one/app.png",
            splashBackgroundColor: "#000000",
          },
        },
      }),
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl: "https://foretell.one/image.png",
        button: {
          title: "Launch Foretell",
          action: {
            type: "launch_miniapp",
            name: "Foretell",
            splashImageUrl: "https://foretell.one/app.png",
            splashBackgroundColor: "#000000",
          },
        },
      }),
    },
  };
}

export default async function Page({ params }: AsyncProps) {
  const { surveyId } = await params;

  return (
    <section className="flex flex-col w-screen overflow-hidden items-center rounded-2xl md:rounded-3xl py-3">
      <RenderSurvey surveyId={surveyId} />
      <MerkleRootUpdater surveyId={surveyId} />
    </section>
  );
}
