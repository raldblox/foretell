export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL;

  return Response.json({
    accountAssociation: {
      header:
        "eyJmaWQiOjQ1OTA4OSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGFCODVFYzIxQzlmRDQ4M2I5QUM3ODg0QTg0MjBEYjkyQ2IzNUZmMWIifQ",
      payload: "eyJkb21haW4iOiJmb3JldGVsbC5vbmUifQ",
      signature:
        "MHhkOWQ1OGQwYzg5YjgxMjliMDRjY2MzMmFkYjA1ZTk0NWZjNzliOGZmMWE5ZmYxODBhNjIyYjYxZjVjY2RlMjBkNjFlZTM3NjFlNWM5ZGMyY2E2ZDY5ZjE1NzkzNTRiN2ViNWVjZDk4NWE3OGUwOTU5ZjM1MDE0ZTU5ZjE1NDNmMDFj",
    },
    frame: {
      name: "Foretell",
      version: "1",
      iconUrl: "https://foretell.one/icon-squared.png",
      homeUrl: "https://foretell.one",
      imageUrl: "https://foretell.one/icon-squared.png",
      buttonTitle: "Launch Foretell",
      splashImageUrl: "https://foretell.one/app.png",
      splashBackgroundColor: "#000000",
      webhookUrl: "https://foretell.one/api/webhook",
      subtitle: "It's foretelling time!",
      description: "Online surveys meets prediction markets",
      primaryCategory: "social",
      tags: ["social", "prediction", "survey"],
      heroImageUrl: "https://foretell.one/icon-squared.png",
      ogTitle: "Foretell",
    },
  });
}
