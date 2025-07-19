export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL;

  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    },
    frame: {
      name: "Foretell",
      version: "1",
      iconUrl: "https://foretell.app/app.png",
      homeUrl: "https://foretell.app",
      imageUrl: "https://foretell.app/image.png",
      buttonTitle: "Launch Foretell",
      splashImageUrl: "https://foretell.app/splash.png",
      splashBackgroundColor: "#000000",
      webhookUrl: "https://foretell.app/api/webhook",
      subtitle: "It's foretelling time!",
      description: "Online surveys meets prediction markets",
      primaryCategory: "social",
      tags: ["social", "prediction", "survey"],
      heroImageUrl: "https://foretell.app/app.png",
      ogTitle: "Foretell",
    },
  });
}
