import { NextResponse } from "next/server";

const UNITED_ENERGY_FEED =
  "https://ds5ykmduea4ri.cloudfront.net/outages-v2.json";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const feedUrl =
      UNITED_ENERGY_FEED + "?version=" + Date.now();

    const response = await fetch(feedUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Generator-Rental-Australia-Outage-Map/1.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        "United Energy returned HTTP " + response.status
      );
    }

    const data = await response.json();

    return NextResponse.json(
      {
        success: true,
        distributor: "United Energy",
        officialSource:
          "https://www.unitedenergy.com.au/outage-map/",
        collectedAt: new Date().toISOString(),
        data,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("United Energy feed error:", error);

    return NextResponse.json(
      {
        success: false,
        distributor: "United Energy",
        collectedAt: new Date().toISOString(),
        error: "United Energy outage data is temporarily unavailable.",
      },
      {
        status: 502,
      }
    );
  }
}
