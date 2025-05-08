import { NextRequest, NextResponse } from "next/server";
import robotsParser from "robots-parser";

const AI_CRAWLERS = [
  "AI2Bot",
  "Ai2Bot-Dolma",
  "aiHitBot",
  "Amazonbot",
  "anthropic-ai",
  "Applebot",
  "Applebot-Extended",
  "Brightbot 1.0",
  "Bytespider",
  "CCBot",
  "ChatGPT-User",
  "Claude-Web",
  "ClaudeBot",
  "cohere-ai",
  "cohere-training-data-crawler",
  "Cotoyogi",
  "Crawlspace",
  "Diffbot",
  "DuckAssistBot",
  "FacebookBot",
  "Factset_spyderbot",
  "FirecrawlAgent",
  "FriendlyCrawler",
  "Google-Extended",
  "GoogleOther",
  "GoogleOther-Image",
  "GoogleOther-Video",
  "GPTBot",
  "iaskspider/2.0",
  "ICC-Crawler",
  "ImagesiftBot",
  "img2dataset",
  "imgproxy",
  "ISSCyberRiskCrawler",
  "Kangaroo Bot",
  "meta-externalagent",
  "Meta-ExternalAgent",
  "meta-externalfetcher",
  "Meta-ExternalFetcher",
  "NovaAct",
  "OAI-SearchBot",
  "omgili",
  "omgilibot",
  "Operator",
  "PanguBot",
  "Perplexity-User",
  "PerplexityBot",
  "PetalBot",
  "Scrapy",
  "SemrushBot-OCOB",
  "SemrushBot-SWA",
  "Sidetrade indexer bot",
  "TikTokSpider",
  "Timpibot",
  "VelenPublicWebCrawler",
  "Webzio-Extended",
  "YouBot",
];

interface RuleAnalysis {
  userAgent: string;
  isAllowedRoot: boolean | undefined; // undefined if not explicitly mentioned and no global rule applies
  specificRules: string[]; // Raw lines of rules for this user-agent
}

export interface RobotsAnalysisResult {
  source: string;
  robotsContent: string;
  analysis: RuleAnalysis[];
  sitemap?: string | string[];
  detailedRecommendations: string[];
  optimizationScore: number; // A simple score e.g. 0-100
}

// Helper function to generate detailed recommendations
function generateDetailedRecommendations(
  analysis: RuleAnalysis[],
  sitemaps: string[]
): { recommendations: string[]; score: number } {
  const recommendations: string[] = [];
  let score = 100; // Start with a perfect score

  const generalAccess = analysis.find((r) => r.userAgent === "*");

  for (const crawler of AI_CRAWLERS) {
    const rule = analysis.find((r) => r.userAgent === crawler);
    if (rule) {
      if (rule.isAllowedRoot === false) {
        recommendations.push(
          `Specific rule for ${crawler} disallows access to '/'. If this is unintentional, consider removing or modifying this rule (e.g., \`User-agent: ${crawler}\nAllow: /\`).`
        );
        score -= 30; // Major penalty for disallowing a key AI bot
      } else if (rule.isAllowedRoot === undefined) {
        // No specific rule, check general access
        if (generalAccess && generalAccess.isAllowedRoot === false) {
          recommendations.push(
            `${crawler} is likely disallowed due to a general \`User-agent: *\nDisallow: /\` rule. If you want ${crawler} to access your site, consider adding a specific \`User-agent: ${crawler}\nAllow: /\` directive.`
          );
          score -= 20; // Penalty for general disallow affecting AI bot
        } else {
          recommendations.push(`${crawler} appears to be allowed access`);
        }
      } else {
        recommendations.push(
          `${crawler} is explicitly allowed access to '/'. Excellent!`
        );
      }
    } else {
      // No specific rule found for this AI crawler
      if (generalAccess && generalAccess.isAllowedRoot === false) {
        recommendations.push(
          `No specific rule for ${crawler}, and general access (\`User-agent: *\`) disallows access to '/'. To allow ${crawler}, add \`User-agent: ${crawler}\nAllow: /\`.`
        );
        score -= 20;
      } else {
        recommendations.push(
          `No specific rules found for ${crawler}. It will follow general access rules (\`User-agent: *\`). Consider adding specific rules if you need granular control.`
        );
        // Minor or no penalty if '*' is allowed
        if (
          generalAccess &&
          generalAccess.isAllowedRoot === undefined &&
          recommendations.length === AI_CRAWLERS.length
        ) {
          recommendations.push(
            "General access for '*' is not explicitly set for '/', which usually defaults to allowed. This is acceptable."
          );
        }
      }
    }
  }

  if (
    generalAccess &&
    generalAccess.isAllowedRoot === false &&
    !analysis.some(
      (r) => AI_CRAWLERS.includes(r.userAgent) && r.isAllowedRoot === true
    )
  ) {
    recommendations.push(
      "General access (`User-agent: *`) disallows access to '/', and no specific AI crawlers are explicitly allowed. This will prevent most AI crawlers from accessing your site."
    );
    score = Math.min(score, 20); // Cap score if all are blocked by general rule
  } else if (
    generalAccess &&
    generalAccess.isAllowedRoot === undefined &&
    AI_CRAWLERS.every(
      (c) =>
        analysis.find((r) => r.userAgent === c)?.isAllowedRoot === undefined
    )
  ) {
    recommendations.push(
      "No explicit allow or disallow for '/' found for general or specific AI user agents. This usually means access is allowed, which is generally good for AI crawlers."
    );
  } else if (
    generalAccess &&
    generalAccess.isAllowedRoot === true &&
    AI_CRAWLERS.every(
      (c) => analysis.find((r) => r.userAgent === c)?.isAllowedRoot !== false
    )
  ) {
    recommendations.push(
      "General access (`User-agent: *`) allows access to '/', and no key AI crawlers are specifically disallowed. This is a good setup for AI visibility."
    );
  }

  if (!sitemaps || sitemaps.length === 0) {
    recommendations.push(
      "No sitemap(s) found in robots.txt. Consider adding a sitemap directive (e.g., `Sitemap: https://yourdomain.com/sitemap.xml`) to help crawlers discover your content."
    );
    score -= 10;
  } else {
    recommendations.push(`Sitemap(s) found: ${sitemaps.join(", ")}.`);
  }

  score = Math.max(0, Math.min(100, score)); // Clamp score between 0 and 100

  if (recommendations.length === 0)
    recommendations.push(
      "No specific issues found with robots.txt regarding common AI crawlers. Looks good!"
    );

  return { recommendations, score };
}

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
    } = generateDetailedRecommendations(analysisData, sitemaps);

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
