import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RuleAnalysis } from "@/app/dashboard/types"; // Import RuleAnalysis from the new location
import { AI_CRAWLERS } from "@/lib/config"; // Import AI_CRAWLERS from new location
import robotsParser from "robots-parser"; // Add import for robotsParser

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Use the imported RuleAnalysis type, aliased to avoid naming conflict if necessary
// or ensure this definition is consistent with the one in app/api/analyze/route.ts
// For now, let's use the imported AppRuleAnalysis and remove the local one.
// export interface RuleAnalysis { // This local definition will be removed
//   userAgent: string;
//   isAllowedRoot: boolean | undefined;
//   specificRules: string[];
// }

export function generateDetailedRecommendations(
  analysis: RuleAnalysis[], // Use RuleAnalysis from @/app/dashboard/types
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
          `Specific rule for ${crawler} disallows access to '/'. If this is unintentional, consider removing or modifying this rule (e.g., \`User-agent: ${crawler}\\nAllow: /\`).`
        );
        score -= 30; // Major penalty for disallowing a key AI bot
      } else if (rule.isAllowedRoot === undefined) {
        // No specific rule, check general access
        if (generalAccess && generalAccess.isAllowedRoot === false) {
          recommendations.push(
            `${crawler} is likely disallowed due to a general \`User-agent: *\\nDisallow: /\` rule. If you want ${crawler} to access your site, consider adding a specific \`User-agent: ${crawler}\\nAllow: /\` directive.`
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
          `No specific rule for ${crawler}, and general access (\`User-agent: *\`) disallows access to '/'. To allow ${crawler}, add \`User-agent: ${crawler}\\nAllow: /\`.`
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
      (c: string) =>
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
      (c: string) =>
        analysis.find((r) => r.userAgent === c)?.isAllowedRoot !== false
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

export interface FetchRobotsTxtResult {
  robotsContent: string;
  robotsUrl: string;
  fetchError: string | null;
  parsedBaseUrl: URL;
}

export async function fetchRobotsTxt(
  targetUrl: string
): Promise<FetchRobotsTxtResult> {
  let parsedBaseUrl;
  let robotsUrl;
  try {
    parsedBaseUrl = new URL(
      targetUrl.startsWith("http") ? targetUrl : `http://${targetUrl}`
    );
    robotsUrl = `${parsedBaseUrl.protocol}//${parsedBaseUrl.hostname}/robots.txt`;
  } catch {
    // This case should ideally be caught before calling, or handled as a specific error response
    // For now, rethrow or return a structured error if this function is meant to be more generic
    throw new Error("Invalid URL format provided");
  }

  console.log(`Fetching robots.txt from: ${robotsUrl}`);
  let robotsContent = "";
  let fetchError = null;

  try {
    const response = await fetch(robotsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

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
      console.log(
        `robots.txt not found at ${robotsUrl}. Assuming default allow.`
      );
      robotsContent = ""; // Treat as empty robots.txt
    } else {
      // This error will be caught by the outer try/catch and returned by POST
      // Or, this function could return a specific error structure
      throw new Error(`Failed to fetch robots.txt. Status: ${response.status}`);
    }
  } catch (error) {
    // Catch fetch errors (network, timeout, or thrown above)
    console.error(`Fetch error for ${robotsUrl}:`, error);
    fetchError = error instanceof Error ? error.message : "Unknown fetch error";
    robotsContent = ""; // Ensure content is empty on error
    // Depending on desired behavior, re-throw or ensure fetchError is set
    if (
      !(
        error instanceof Error &&
        error.message.startsWith("Failed to fetch robots.txt")
      )
    ) {
      // If it's not the specific error we throw for HTTP status, wrap it or handle it
      // For now, we let fetchError carry the message
    }
    // if the error is about the URL format, it's already thrown by new URL()
  }

  return { robotsContent, robotsUrl, fetchError, parsedBaseUrl };
}

export function analyzeRobotsTxt(
  robotsContent: string,
  robotsUrl: string, // technically parser takes this, and it's part of fetch result
  aiCrawlersList: string[] // This parameter name is generic, it receives AI_CRAWLERS from the caller
): { analysisData: RuleAnalysis[]; sitemaps: string[] } {
  const parser = robotsParser(robotsUrl, robotsContent);
  const analysisData: RuleAnalysis[] = [];
  const allUserAgents = ["*", ...aiCrawlersList];
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
  return { analysisData, sitemaps };
}
