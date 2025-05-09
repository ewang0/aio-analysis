import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AI_CRAWLERS } from "@/lib/config";
import robotsParser from "robots-parser";
import { RuleAnalysis } from "@/app/dashboard/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateDetailedRecommendations(
  analysis: RuleAnalysis[], // Use RuleAnalysis from @/app/dashboard/types
  sitemaps: string[],
  robotsContent: string // Added robotsContent for size check and other raw content analysis
): { recommendations: string[]; score: number } {
  let recommendations: string[] = []; // Make it let to allow filtering
  let score = 100; // Start with a perfect score
  const positivePractices: string[] = [];

  // Accessibility Check: File Size
  const MAX_FILE_SIZE_KB = 512;
  const fileSizeKB = robotsContent.length / 1024;
  if (fileSizeKB > MAX_FILE_SIZE_KB) {
    recommendations.push(
      `The robots.txt file size (${fileSizeKB.toFixed(
        1
      )}KB) exceeds the recommended maximum of ${MAX_FILE_SIZE_KB}KB. Very large files can be problematic for crawlers. Consider simplifying your robots.txt.`
    );
    score -= 20; // Penalty for oversized file
  } else {
    positivePractices.push("maintaining an optimal robots.txt file size");
  }

  const generalAccess = analysis.find((r) => r.userAgent === "*");

  for (const crawler of AI_CRAWLERS) {
    const rule = analysis.find((r) => r.userAgent === crawler);

    if (rule) {
      if (rule.isAllowedRoot === false) {
        recommendations.push(
          `Major Issue: Specific rule for ${crawler} disallows access to '/'. If this is unintentional, change to 'Allow: /' or remove the block (e.g., \`User-agent: ${crawler}\\nAllow: /\`).`
        );
        score -= 30;
      } else if (rule.isAllowedRoot === true) {
        recommendations.push(
          `Good: ${crawler} is explicitly allowed access to '/'.`
        );
        score += 2;
      } else {
        if (generalAccess && generalAccess.isAllowedRoot === false) {
          recommendations.push(
            `Warning: ${crawler} has no specific '/' rule and is likely disallowed by a general \`User-agent: *\\nDisallow: /\` rule. To allow ${crawler}, add \`User-agent: ${crawler}\\nAllow: /\`.`
          );
          score -= 20;
        } else {
          recommendations.push(
            `Info: ${crawler} has no specific '/' rule. It will follow general access rules for '/'. For clarity, consider adding an explicit \`User-agent: ${crawler}\\nAllow: /\`.`
          );
        }
      }

      let hasAICrawlDelay = false;
      for (const specificRule of rule.specificRules) {
        const lowerSpecificRule = specificRule.toLowerCase();
        if (lowerSpecificRule.startsWith("disallow:")) {
          const path = specificRule.substring("disallow:".length).trim();
          if (path.length > 1 && path !== "/") {
            recommendations.push(
              `Consideration: For AI crawler ${crawler}, the rule \`${specificRule}\` might be overly restrictive. Review if ${crawler} needs access to this path for better context or functionality.`
            );
            score -= 3;
          }
        } else if (lowerSpecificRule.startsWith("crawl-delay:")) {
          hasAICrawlDelay = true;
          const delayStr = specificRule.substring("crawl-delay:".length).trim();
          const delay = parseInt(delayStr, 10);
          if (!isNaN(delay)) {
            if (delay > 5) {
              recommendations.push(
                `Warning: Crawl-delay for ${crawler} is ${delay} seconds. This is high and might slow down content discovery. Consider reducing it if not essential.`
              );
              score -= 5;
            } else {
              recommendations.push(
                `Info: Crawl-delay of ${delay} seconds is set for ${crawler}. Ensure this aligns with your server capacity and crawling goals for AI.`
              );
              score -= 1;
            }
          }
        }
      }
      // If no specific broad disallows or high crawl delays were found for THIS crawler, it's a positive for this crawler.
      // Aggregated check for this good practice will be done later.

      if (!hasAICrawlDelay && generalAccess?.specificRules) {
        for (const generalRule of generalAccess.specificRules) {
          const lowerGeneralRule = generalRule.toLowerCase();
          if (lowerGeneralRule.startsWith("crawl-delay:")) {
            const delayStr = generalRule
              .substring("crawl-delay:".length)
              .trim();
            const delay = parseInt(delayStr, 10);
            if (!isNaN(delay) && delay > 0) {
              recommendations.push(
                `Info: ${crawler} may inherit a Crawl-delay of ${delay} from general rules (*). If this is high (e.g. >5s), consider a specific, lower crawl-delay for ${crawler} or setting it to 0.`
              );
              if (delay > 5) score -= 3;
              else score -= 1;
              break;
            }
          }
        }
      }
    } else {
      if (generalAccess && generalAccess.isAllowedRoot === false) {
        recommendations.push(
          `Major Issue: No specific rule for ${crawler}, and general access (\`User-agent: *\`) disallows access to '/'. To allow ${crawler}, add \`User-agent: ${crawler}\\nAllow: /\`.`
        );
        score -= 25;
      } else if (generalAccess && generalAccess.isAllowedRoot === true) {
        recommendations.push(
          `Info: No specific rules found for ${crawler}. It will follow general access rules (\`User-agent: *\`), which currently allow access to '/'. Consider adding specific rules if you need granular control or to ensure future changes to '*' don't unintentionally block it.`
        );
      } else {
        recommendations.push(
          `Info: No specific rules found for ${crawler}. It will likely follow default access rules (generally allowed for '/'). Consider adding specific rules (\`User-agent: ${crawler}\\nAllow: /\`) for clarity and granular control.`
        );
      }
    }
  }

  if (generalAccess) {
    if (
      generalAccess.isAllowedRoot === false &&
      !analysis.some(
        (r) => AI_CRAWLERS.includes(r.userAgent) && r.isAllowedRoot === true
      )
    ) {
      const existingRec = recommendations.find(
        (rec) =>
          rec.startsWith(
            "Critical: General access (`User-agent: *`) disallows access to '/', and no specific AI crawlers are explicitly allowed."
          ) ||
          rec.startsWith(
            // also check for major issue if it was already added for a specific crawler
            "General access (`User-agent: *`) disallows access to '/', and no specific AI crawlers are explicitly allowed."
          )
      );
      if (!existingRec) {
        recommendations.push(
          "Critical: General access (`User-agent: *`) disallows access to '/', and no specific AI crawlers are explicitly allowed. This will prevent most AI crawlers from accessing your site."
        );
      }
      score = Math.min(score, 10);
    } else if (
      generalAccess.isAllowedRoot === true &&
      AI_CRAWLERS.every(
        (c) => analysis.find((r) => r.userAgent === c)?.isAllowedRoot !== false
      )
    ) {
      const existingRec = recommendations.find((rec) =>
        rec.startsWith(
          "Good: General access (`User-agent: *`) allows access to '/', and no key AI crawlers are specifically disallowed."
        )
      );
      if (!existingRec) {
        recommendations.push(
          "Good: General access (`User-agent: *`) allows access to '/', and no key AI crawlers are specifically disallowed. This is a positive setup for AI visibility."
        );
      }
    }
    const generalCrawlDelayMentioned = recommendations.some(
      (rec) =>
        rec.includes("Crawl-delay") && rec.includes("from general rules (*)")
    );
    if (!generalCrawlDelayMentioned && generalAccess?.specificRules) {
      for (const generalRule of generalAccess.specificRules) {
        const lowerGeneralRule = generalRule.toLowerCase();
        if (lowerGeneralRule.startsWith("crawl-delay:")) {
          const delayStr = generalRule.substring("crawl-delay:".length).trim();
          const delay = parseInt(delayStr, 10);
          if (!isNaN(delay) && delay > 0) {
            recommendations.push(
              `Warning: A general Crawl-delay of ${delay} seconds is set for \`*\`. This will affect all crawlers not having their own specific crawl-delay, including potentially some AI crawlers. If this is high (e.g. >5s), it might slow them down.`
            );
            if (delay > 5) score -= 5;
            else score -= 2;
            break;
          }
        }
      }
    }
  } else {
    recommendations.push(
      "Info: No general `User-agent: *` block found. This typically means all paths are allowed by default unless specified otherwise for particular user-agents. This is generally good for crawlability."
    );
  }

  if (!sitemaps || sitemaps.length === 0) {
    recommendations.push(
      "Important: No sitemap(s) found in robots.txt. Add a sitemap directive (e.g., `Sitemap: https://yourdomain.com/sitemap.xml`) to help all crawlers, including AI, discover your content efficiently."
    );
    score -= 10;
  } else {
    recommendations.push(`Good: Sitemap(s) found: ${sitemaps.join(", ")}.`);
    score += 5;
    positivePractices.push("including sitemap(s) for content discovery");
  }

  // Aggregate positive practices based on final state of analysis
  let allAICrawlersCanAccessRoot = AI_CRAWLERS.length > 0;
  let actualAllowedAICount = 0;
  if (AI_CRAWLERS.length > 0) {
    for (const crawlerName of AI_CRAWLERS) {
      const rule = analysis.find((r) => r.userAgent === crawlerName);
      if (!rule || rule.isAllowedRoot === false) {
        // False means explicitly disallowed by its own rules or by *
        allAICrawlersCanAccessRoot = false;
      } else {
        // True or Undefined (implicit allow)
        actualAllowedAICount++;
      }
    }
    if (allAICrawlersCanAccessRoot) {
      positivePractices.push(
        `ensuring root access for all ${AI_CRAWLERS.length} monitored AI crawlers`
      );
    } else if (
      actualAllowedAICount / AI_CRAWLERS.length >= 0.7 &&
      actualAllowedAICount > 0
    ) {
      positivePractices.push(
        `providing root access for a majority (${actualAllowedAICount}/${AI_CRAWLERS.length}) of monitored AI crawlers`
      );
    }
  }

  const generalStarAllowsOrIsUndefined =
    generalAccess &&
    (generalAccess.isAllowedRoot === true ||
      generalAccess.isAllowedRoot === undefined);
  const noGeneralStarBlock = !generalAccess;
  let isGeneralPolicyPermissive = false;
  if (generalStarAllowsOrIsUndefined || noGeneralStarBlock) {
    let blocksAICrawlerViaStar = false;
    if (generalAccess && generalAccess.isAllowedRoot === false) {
      if (
        !analysis.some(
          (r) => AI_CRAWLERS.includes(r.userAgent) && r.isAllowedRoot === true
        )
      ) {
        blocksAICrawlerViaStar = true;
      }
    }
    if (!blocksAICrawlerViaStar) {
      positivePractices.push(
        "maintaining a generally permissive crawling policy (`User-agent: *`)"
      );
      isGeneralPolicyPermissive = true;
    }
  }

  const hasBroadDisallowsIssue = recommendations.some((r) =>
    r.includes("might be overly restrictive")
  );
  const hasHighCrawlDelaysIssue = recommendations.some(
    (r) =>
      r.includes("Crawl-delay for") &&
      (r.includes("is high") ||
        (r.includes("may inherit a Crawl-delay") &&
          parseInt(r.match(/of (\\d+)/)?.[1] || "0") > 5))
  );
  if (
    !hasBroadDisallowsIssue &&
    !hasHighCrawlDelaysIssue &&
    (allAICrawlersCanAccessRoot || actualAllowedAICount > 0) &&
    isGeneralPolicyPermissive
  ) {
    positivePractices.push(
      "avoiding common pitfalls like overly broad disallows or high crawl-delays for AI agents"
    );
  }

  score = Math.max(0, Math.min(100, score));

  // Filter out old summary messages before adding new one
  recommendations = recommendations.filter(
    (r) =>
      r !==
        "Excellent: Your robots.txt appears well-optimized for AI crawlers based on these checks!" &&
      r !==
        "Good: Your robots.txt is reasonably configured for AI crawlers, with some areas for potential improvement noted below."
  );

  let summaryMessage = "";
  const uniquePositivePractices = Array.from(new Set(positivePractices)); // Deduplicate

  const hasMajorOrCriticalIssues = recommendations.some(
    (r) => r.startsWith("Major Issue:") || r.startsWith("Critical:")
  );
  const hasWarningsOrImportant = recommendations.some(
    (r) => r.startsWith("Warning:") || r.startsWith("Important:")
  );

  if (score >= 90 && !hasMajorOrCriticalIssues && !hasWarningsOrImportant) {
    summaryMessage =
      "Excellent: Your robots.txt is well-optimized for AI crawlers. ";
    if (uniquePositivePractices.length > 0) {
      summaryMessage +=
        "Key good practices observed: " +
        uniquePositivePractices.join("; ") +
        ".";
    } else {
      summaryMessage +=
        "It effectively allows access and follows key best practices.";
    }
  } else if (score >= 75 && !hasMajorOrCriticalIssues) {
    summaryMessage =
      "Good: Your robots.txt is reasonably configured for AI crawlers. ";
    if (uniquePositivePractices.length > 0) {
      summaryMessage +=
        "Positive aspects include: " + uniquePositivePractices.join("; ") + ".";
    }
    const actionableRecs =
      recommendations.filter(
        (r) =>
          !r.startsWith("Info:") &&
          !r.startsWith("Good:") && // Already prefixed positive statements
          !r.startsWith("Excellent:") &&
          r !== summaryMessage.trim()
      ).length > 0;

    if (actionableRecs) {
      summaryMessage +=
        " Some suggestions for further refinement are listed below.";
    } else if (uniquePositivePractices.length > 0 && !hasWarningsOrImportant) {
      // Only add if no pending warnings
      summaryMessage += " Keep up the good work!";
    }
  } else if (score >= 50) {
    summaryMessage =
      "Okay: Your robots.txt has areas for improvement for AI crawler optimization. Please review the suggestions below, focusing on warnings and major issues.";
  } else {
    summaryMessage =
      "Needs Improvement: Your robots.txt requires significant attention to better support AI crawlers. Focus on the critical issues and warnings listed below.";
  }

  if (summaryMessage) {
    recommendations.unshift(summaryMessage.trim());
  }

  if (recommendations.length === 0 && !summaryMessage) {
    recommendations.push(
      "No specific recommendations generated. Your robots.txt is either very minimal or complex in a way not covered by standard checks. Ensure it allows access for desired AI crawlers."
    );
  }

  const finalRecommendations = Array.from(new Set(recommendations));
  return { recommendations: finalRecommendations, score };
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
