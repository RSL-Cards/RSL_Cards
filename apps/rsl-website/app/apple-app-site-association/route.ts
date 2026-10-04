const association = {
  applinks: {
    apps: [] as string[],
    details: [
      {
        appID: "88U8P648DG.com.rslcards.dealer",
        paths: ["*", "/support", "/privacy-policy", "/terms&conditions"],
      },
    ],
  },
  webcredentials: {
    apps: ["88U8P648DG.com.rslcards.dealer"],
  },
};

export function GET() {
  return new Response(JSON.stringify(association), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
