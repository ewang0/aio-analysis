import { NextRequest, NextResponse } from "next/server";
import robotsParser from "robots-parser";
import { RobotsAnalysisResult, RuleAnalysis } from "@/app/dashboard/types";
import { AI_CRAWLERS } from "@/lib/config";
import { generateDetailedRecommendations } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const targetUrl = body.url;

    if (!targetUrl) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let parsedBaseUrl;
    let robotsUrl;
    try {
      parsedBaseUrl = new URL(
        targetUrl.startsWith("http") ? targetUrl : `http://${targetUrl}`
      );
      robotsUrl = `${parsedBaseUrl.protocol}//${parsedBaseUrl.hostname}/robots.txt`;
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format provided" },
        { status: 400 }
      );
    }

    console.log(`Fetching robots.txt from: ${robotsUrl}`);

    const response = await fetch(robotsUrl, {
      headers: {
        // Pretend to be a common browser to avoid simple blocks
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      redirect: "follow", // Follow redirects
      signal: AbortSignal.timeout(8000), // Timeout after 8 seconds
    });

    let robotsContent = "";
    let fetchError = null;

    if (response.ok) {
      robotsContent = await response.text();
      if (
        robotsContent.trim().toLowerCase().startsWith("<!doctype html") ||
        robotsContent.trim().toLowerCase().startsWith("<html")
      ) {
        fetchError = `The content at ${robotsUrl} appears to be an HTML page, not a valid robots.txt file. Analysis cannot proceed.`;
        robotsContent = ""; // Treat as empty for parsing to avoid parser errors
      }
    } else if (response.status === 404) {
      // robots.txt not found, which is acceptable. Proceed with default allow for all.
      console.log(
        `robots.txt not found at ${robotsUrl}. Assuming default allow.`
      );
      robotsContent = ""; // Treat as empty robots.txt
    } else {
      return NextResponse.json(
        { error: `Failed to fetch robots.txt. Status: ${response.status}` },
        { status: response.status }
      );
    }

    const parser = robotsParser(robotsUrl, robotsContent);
    const analysisData: RuleAnalysis[] = [];
    const allUserAgents = ["*", ...AI_CRAWLERS]; // Check general rules first, then specific AI crawlers
    const rawLines = robotsContent.split("\n");

    for (const ua of allUserAgents) {
      const specificRules: string[] = [];
      let inSpecificBlock = false;
      rawLines.forEach((line) => {
        const lowerLine = line.toLowerCase().trim();
        if (lowerLine.startsWith(`user-agent: ${ua.toLowerCase()}`)) {
          inSpecificBlock = true;
          specificRules.push(line.trim());
        } else if (lowerLine.startsWith("user-agent:") && inSpecificBlock) {
          inSpecificBlock = false;
        } else if (
          inSpecificBlock &&
          (lowerLine.startsWith("allow:") ||
            lowerLine.startsWith("disallow:") ||
            lowerLine.startsWith("crawl-delay:"))
        ) {
          specificRules.push(line.trim());
        }
      });

      analysisData.push({
        userAgent: ua,
        isAllowedRoot: parser.isAllowed("/", ua),
        specificRules: specificRules,
      });
    }

    const sitemaps = parser.getSitemaps();
    const {
      recommendations: detailedRecommendations,
      score: optimizationScore,
    } = generateDetailedRecommendations(analysisData, sitemaps, robotsContent);

    // If there was a fetch error but we proceeded (e.g. HTML content), add it to recommendations.
    if (fetchError) {
      detailedRecommendations.unshift(`Warning: ${fetchError}`);
    }

    const result: RobotsAnalysisResult = {
      source: robotsUrl,
      robotsContent,
      analysis: analysisData,
      sitemap:
        sitemaps.length > 0
          ? sitemaps.length === 1
            ? sitemaps[0]
            : sitemaps
          : undefined,
      detailedRecommendations,
      optimizationScore,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error:", error);
    // Check if error is an instance of Error to safely access message property
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      { error: "Failed to process request", details: errorMessage },
      { status: 500 }
    );
  }
}
