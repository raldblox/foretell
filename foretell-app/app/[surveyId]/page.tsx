import { Metadata, ResolvingMetadata } from "next";
import { RenderSurvey } from "@/components/render-survey";

type Props = {
  params: Promise<{ surveyId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { surveyId } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const ogUrl = surveyId
    ? `${baseUrl}/api/og?surveyId=${encodeURIComponent(surveyId as string)}`
    : `${baseUrl}/api/og`;

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: "Foretell",
    description: "It's foretelling time!",
    openGraph: {
      images: [ogUrl, ...previousImages],
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

export default async function Page({ params }: Props) {
  const { surveyId } = await params;

  return (
    <section className="flex flex-col w-screen overflow-hidden items-center rounded-2xl md:rounded-3xl py-3">
      <RenderSurvey surveyId={surveyId} />
    </section>
  );
}
