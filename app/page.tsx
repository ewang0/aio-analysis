"use client";

import { useState } from "react";

// Define the interfaces based on the API response
interface RuleAnalysis {
  userAgent: string;
  isAllowedRoot: boolean | undefined;
  specificRules: string[];
}

interface RobotsAnalysisResult {
  source: string;
  robotsContent: string;
  analysis: RuleAnalysis[];
  sitemap?: string | string[];
  detailedRecommendations: string[];
  optimizationScore: number;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<RobotsAnalysisResult | null>(null);
  const [apiError, setApiError] = useState("");

  const handleAnalyzeClick = async () => {
    setValidationError("");
    setApiError("");
    setAnalysisResult(null);

    if (!url.trim()) {
      setValidationError("URL cannot be empty.");
      return;
    }
    try {
      new URL(url.startsWith("http") ? url : `http://${url}`);
    } catch {
      setValidationError(
        "Please enter a valid URL (e.g., http://example.com or example.com)."
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        setApiError(
          data.error ||
            `Failed to analyze. Server responded with ${response.status}`
        );
      } else {
        setAnalysisResult(data as RobotsAnalysisResult);
      }
    } catch (err) {
      setApiError(
        "An unexpected error occurred while trying to analyze the URL."
      );
      console.error(err);
    }
    setIsLoading(false);
  };

  // Helper to determine color for score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 dark:text-green-400";
    if (score >= 50) return "text-amber-500 dark:text-amber-400";
    return "text-red-500 dark:text-red-400";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <header className="w-full max-w-2xl text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-sky-600 dark:text-sky-400">
          AI Optimization (AIO) Analysis Tool
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          Assess how well your site&apos;s robots.txt file is optimized for
          AI-based crawlers and get actionable recommendations.
        </p>
      </header>

      <main className="w-full max-w-2xl bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 sm:p-8">
        <section id="input-section" aria-labelledby="input-heading">
          <h2
            id="input-heading"
            className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100"
          >
            Analyze Your Site
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (validationError) setValidationError("");
                if (apiError) setApiError("");
              }}
              placeholder="Enter domain or URL (e.g., example.com)"
              className={`flex-grow p-3 border ${
                validationError
                  ? "border-red-500"
                  : "border-slate-300 dark:border-slate-600"
              } rounded-md focus:ring-2 ${
                validationError ? "focus:ring-red-500" : "focus:ring-sky-500"
              } ${
                validationError
                  ? "focus:border-red-500"
                  : "focus:border-sky-500"
              } dark:bg-slate-700 dark:text-slate-50`}
              aria-label="Domain or URL input"
              aria-invalid={!!validationError}
              aria-describedby={validationError ? "url-error" : undefined}
              disabled={isLoading}
            />
            <button
              type="submit"
              onClick={handleAnalyzeClick}
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
          {validationError && (
            <p
              id="url-error"
              className="text-red-500 dark:text-red-400 text-sm mt-2"
            >
              {validationError}
            </p>
          )}
        </section>

        <hr className="my-8 border-slate-200 dark:border-slate-700" />

        <section
          id="results-section"
          aria-labelledby="results-heading"
          className="mt-8"
        >
          <h2
            id="results-heading"
            className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100"
          >
            Analysis Overview
          </h2>
          <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-md min-h-[100px] text-slate-600 dark:text-slate-300 space-y-6">
            {isLoading && (
              <p className="text-center text-sky-600 dark:text-sky-400">
                Loading robots.txt content and analyzing...
              </p>
            )}
            {apiError && (
              <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 rounded-md">
                <p className="font-semibold text-red-700 dark:text-red-300">
                  Error Fetching or Analyzing Data:
                </p>
                <p className="text-red-600 dark:text-red-400">{apiError}</p>
              </div>
            )}
            {analysisResult && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Robots.txt AI Optimization Score:
                  </h3>
                  <p
                    className={`text-5xl font-bold text-center py-4 rounded-md ${getScoreColor(
                      analysisResult.optimizationScore
                    )} bg-slate-200 dark:bg-slate-600`}
                  >
                    {analysisResult.optimizationScore} / 100
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">
                    Crawler Access Details:
                  </h3>
                  <div className="overflow-x-auto bg-white dark:bg-slate-800 p-4 rounded-md shadow">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-600">
                      <thead className="bg-slate-50 dark:bg-slate-700">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider"
                          >
                            User-Agent
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider"
                          >
                            Root Access (/)?
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider"
                          >
                            Specific Rules Found
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-600">
                        {analysisResult.analysis.map((rule) => (
                          <tr key={rule.userAgent}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                              {rule.userAgent}
                            </td>
                            <td
                              className={`px-6 py-4 whitespace-nowrap text-sm ${
                                rule.isAllowedRoot === false
                                  ? "text-red-500 dark:text-red-400"
                                  : rule.isAllowedRoot
                                  ? "text-green-500 dark:text-green-400"
                                  : "text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              {rule.isAllowedRoot === undefined
                                ? "Implicitly Allowed"
                                : rule.isAllowedRoot
                                ? "Allowed"
                                : "Disallowed"}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                              {rule.specificRules.length > 0 ? (
                                <pre className="text-xs bg-slate-100 dark:bg-slate-700 p-2 rounded whitespace-pre-wrap break-all">
                                  {rule.specificRules.join("\n")}
                                </pre>
                              ) : (
                                <em>No specific rules for this agent.</em>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {analysisResult.sitemap && (
                  <div>
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
                      Sitemap(s) Found:
                    </h3>
                    <div className="p-3 bg-slate-200 dark:bg-slate-600 rounded-md text-sm">
                      {Array.isArray(analysisResult.sitemap) ? (
                        analysisResult.sitemap.map((s, i) => (
                          <a
                            href={s}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={i}
                            className="block text-sky-600 hover:underline dark:text-sky-400"
                          >
                            {s}
                          </a>
                        ))
                      ) : (
                        <a
                          href={analysisResult.sitemap}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sky-600 hover:underline dark:text-sky-400"
                        >
                          {analysisResult.sitemap}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Raw robots.txt Content:
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Fetched from:{" "}
                    <a
                      href={analysisResult.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:underline dark:text-sky-400"
                    >
                      {analysisResult.source}
                    </a>
                  </p>
                  {analysisResult.robotsContent ? (
                    <pre className="whitespace-pre-wrap break-all bg-slate-200 dark:bg-slate-600 p-3 rounded-md text-sm">
                      {analysisResult.robotsContent}
                    </pre>
                  ) : (
                    <p className="italic p-3 bg-slate-200 dark:bg-slate-600 rounded-md">
                      robots.txt is empty or was not found (default allow
                      assumed).
                    </p>
                  )}
                </div>
              </div>
            )}
            {!isLoading && !apiError && !analysisResult && (
              <p className="text-center text-slate-500 dark:text-slate-400">
                Enter a URL above and click &quot;Analyze&quot; to see the
                results.
              </p>
            )}
          </div>
        </section>

        <section
          id="recommendations-section"
          aria-labelledby="recommendations-heading"
          className="mt-8"
        >
          <h2
            id="recommendations-heading"
            className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100"
          >
            Optimization Recommendations (Robots.txt)
          </h2>
          <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-md min-h-[100px] text-slate-600 dark:text-slate-300 space-y-3">
            {isLoading && (
              <p className="text-center text-sky-600 dark:text-sky-400">
                Generating recommendations...
              </p>
            )}
            {apiError && (
              <p className="text-red-500 dark:text-red-400">
                Could not generate recommendations due to an earlier error.
              </p>
            )}
            {analysisResult && analysisResult.detailedRecommendations && (
              <ul className="list-disc list-inside space-y-2">
                {analysisResult.detailedRecommendations.map((rec, index) => (
                  <li
                    key={index}
                    className={`p-2 rounded-md ${
                      rec.toLowerCase().includes("good") ||
                      rec.toLowerCase().includes("excellent")
                        ? "bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                        : rec.toLowerCase().includes("consider") ||
                          rec.toLowerCase().includes("warning")
                        ? "bg-amber-50 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                        : "bg-slate-100 dark:bg-slate-700"
                    }`}
                  >
                    {rec}
                  </li>
                ))}
              </ul>
            )}
            {!isLoading && !apiError && !analysisResult && (
              <p className="text-center text-slate-500 dark:text-slate-400">
                Detailed recommendations based on your robots.txt will appear
                here after analysis.
              </p>
            )}
          </div>
        </section>
      </main>

      <footer className="w-full max-w-2xl text-center mt-12 text-sm text-slate-500 dark:text-slate-400">
        <p>
          &copy; {new Date().getFullYear()} AIO Analysis Tool. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
