"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  InfoIcon,
} from "lucide-react";
import CircularProgressScore from "@/components/ui/circular-progress-score";
import DashboardSkeleton from "@/components/ui/dashboard-skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

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

export default function Page() {
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
      // Attempt to construct a URL to validate it. Prefixes with http if not present.
      const prefixedUrl =
        url.startsWith("http://") || url.startsWith("https://")
          ? url
          : `http://${url}`;
      new URL(prefixedUrl);
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
        body: JSON.stringify({ url }), // Send original URL, API will handle prefixing for robots.txt
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
      const error = err as Error;
      setApiError(
        error.message ||
          "An unexpected error occurred while trying to analyze the URL."
      );
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Tools</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>AIO Analysis</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="w-full h-full space-y-4 flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">AIO Analysis Tool</CardTitle>
              <CardDescription>
                Enter a domain or URL to analyze its robots.txt for AI crawler
                optimization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-grow w-full sm:w-auto">
                  <Input
                    type="url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (validationError) setValidationError("");
                      if (apiError) setApiError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isLoading) {
                        e.preventDefault();
                        handleAnalyzeClick();
                      }
                    }}
                    placeholder="Enter domain or URL (e.g., example.com)"
                    className={`${
                      validationError
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                    aria-label="Domain or URL input"
                    aria-invalid={!!validationError}
                    aria-describedby={
                      validationError ? "url-error-message" : undefined
                    }
                    disabled={isLoading}
                  />
                  {validationError && (
                    <p
                      id="url-error-message"
                      className="text-sm text-red-500 mt-1.5"
                    >
                      {validationError}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleAnalyzeClick}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading ? "Analyzing..." : "Analyze"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoading && <DashboardSkeleton />}

          {apiError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          {analysisResult && (
            <div className="space-y-4 xl:flex xl:flex-row xl:space-y-0 xl:space-x-4">
              <Card className="shadow-md xl:w-1/2">
                <CardHeader>
                  <CardTitle>Analysis Overview</CardTitle>
                  <CardDescription>
                    Summary of your robots.txt configuration for AI crawlers,
                    including access permissions, optimization score, and
                    recommendations for improving crawler management.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        Robots.txt AI Optimization Score
                      </h3>
                      <div className="relative group">
                        <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-popover text-popover-foreground p-2 rounded shadow-md text-sm w-64 z-50">
                          This score represents how well your robots.txt is
                          optimized for AI crawlers. Higher scores indicate
                          better configuration for controlling AI bot access.
                        </div>
                      </div>
                    </div>
                    <div className="pt-4">
                      <CircularProgressScore
                        score={analysisResult.optimizationScore}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Crawler Access Details
                    </h3>
                    <div className="rounded-md border max-h-84 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User-Agent</TableHead>
                            <TableHead>Root Access (/)?</TableHead>
                            <TableHead className="hidden sm:table-cell">
                              Specific Rules
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analysisResult.analysis.map((rule) => (
                            <TableRow key={rule.userAgent}>
                              <TableCell className="font-medium align-top">
                                {rule.userAgent}
                              </TableCell>
                              <TableCell
                                className={`${
                                  rule.isAllowedRoot === false
                                    ? "text-red-600 dark:text-red-400"
                                    : rule.isAllowedRoot === true
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-muted-foreground"
                                } align-top`}
                              >
                                {rule.isAllowedRoot === undefined
                                  ? "Implicitly Allowed"
                                  : rule.isAllowedRoot
                                  ? "Allowed"
                                  : "Disallowed"}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell align-top">
                                {rule.specificRules.length > 0 ? (
                                  <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap break-all font-mono">
                                    {rule.specificRules.join("\n")}
                                  </pre>
                                ) : (
                                  <em className="text-muted-foreground">
                                    No specific rules.
                                  </em>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {analysisResult.sitemap && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          Sitemap(s) Found
                        </h3>
                        <div className="p-3 bg-muted rounded-md text-sm">
                          {Array.isArray(analysisResult.sitemap) ? (
                            analysisResult.sitemap.map((s, i) => (
                              <a
                                href={s}
                                target="_blank"
                                rel="noopener noreferrer"
                                key={i}
                                className="block text-primary hover:underline"
                              >
                                {s}
                              </a>
                            ))
                          ) : (
                            <a
                              href={analysisResult.sitemap}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-primary hover:underline"
                            >
                              {analysisResult.sitemap}
                            </a>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Raw robots.txt Content
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Fetched from:{" "}
                      <a
                        href={analysisResult.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {analysisResult.source}
                      </a>
                    </p>
                    {analysisResult.robotsContent ? (
                      <pre className="whitespace-pre-wrap break-all bg-muted p-3 rounded-md text-sm font-mono max-h-60 overflow-auto">
                        {analysisResult.robotsContent}
                      </pre>
                    ) : (
                      <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertDescription className="text-muted-foreground">
                          robots.txt is empty or was not found (default allow
                          assumed).
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md xl:w-1/2">
                <CardHeader>
                  <CardTitle>Optimization Recommendations</CardTitle>
                  <CardDescription>
                    Based on the robots.txt analysis for AI crawlers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisResult.detailedRecommendations &&
                  analysisResult.detailedRecommendations.length > 0 ? (
                    (() => {
                      const getPriority = (rec: string) => {
                        if (
                          rec.toLowerCase().includes("disallowed") ||
                          rec.toLowerCase().includes("prevent")
                        ) {
                          return 1; // Action Required
                        } else if (
                          rec.toLowerCase().includes("consider") ||
                          rec.toLowerCase().includes("warning")
                        ) {
                          return 2; // Consideration
                        } else if (
                          rec.toLowerCase().includes("good") ||
                          rec.toLowerCase().includes("excellent") ||
                          rec.toLowerCase().includes("allowed")
                        ) {
                          return 3; // Good Practice
                        }
                        return 4; // Others
                      };

                      const sortedRecs = analysisResult.detailedRecommendations
                        .slice()
                        .sort((a, b) => getPriority(a) - getPriority(b));

                      const goodPracticeRecs = sortedRecs.filter(
                        (rec) => getPriority(rec) === 3
                      );
                      const otherRecs = sortedRecs.filter(
                        (rec) => getPriority(rec) !== 3
                      );

                      return (
                        <ul className="space-y-3">
                          {otherRecs.map((rec, index) => {
                            let iconColorClass = "#3b82f6"; // blue-500
                            let IconComponent = InfoIcon;
                            let alertTitle = "Additional Notes";
                            let effectiveAlertVariant:
                              | "default"
                              | "destructive"
                              | undefined = undefined;

                            if (getPriority(rec) === 1) {
                              // Action Required
                              iconColorClass = "#f43f5e"; // rose-500
                              IconComponent = XCircle;
                              alertTitle = "Action Required";
                              effectiveAlertVariant = "destructive";
                            } else if (getPriority(rec) === 2) {
                              // Consideration
                              iconColorClass = "#f59e0b"; // amber-500
                              IconComponent = AlertTriangle;
                              alertTitle = "Consideration";
                            }
                            // Default for priority 4 or any other cases

                            return (
                              <li key={`other-${index}`}>
                                <Alert
                                  variant={effectiveAlertVariant}
                                  className="items-start p-4 border"
                                >
                                  <IconComponent
                                    className="mt-0.5 h-5 w-5"
                                    style={{ color: iconColorClass }}
                                  />
                                  <div className="ml-3 flex-1">
                                    <AlertTitle
                                      className="font-semibold"
                                      style={{ color: iconColorClass }}
                                    >
                                      {alertTitle}
                                    </AlertTitle>
                                    <AlertDescription className="mt-1 text-sm text-muted-foreground">
                                      {rec}
                                    </AlertDescription>
                                  </div>
                                </Alert>
                              </li>
                            );
                          })}

                          {goodPracticeRecs.length > 0 && (
                            <li key="good-practices">
                              <Alert className="items-start p-4 border">
                                <CheckCircle2
                                  className="mt-0.5 h-5 w-5"
                                  style={{ color: "#14b8a6" }} // teal-500
                                />
                                <div className="ml-3 flex-1">
                                  <AlertTitle
                                    className="font-semibold"
                                    style={{ color: "#14b8a6" }}
                                  >
                                    Good Practices
                                  </AlertTitle>
                                  <AlertDescription className="mt-1 text-sm text-muted-foreground">
                                    <ScrollArea className="h-full w-full">
                                      <ul className="list-disc pl-5 space-y-1 pr-4">
                                        {goodPracticeRecs.map((rec, i) => (
                                          <li key={`gp-${i}`}>{rec}</li>
                                        ))}
                                      </ul>
                                    </ScrollArea>
                                  </AlertDescription>
                                </div>
                              </Alert>
                            </li>
                          )}
                        </ul>
                      );
                    })()
                  ) : (
                    <Alert>
                      <InfoIcon className="h-4 w-4" />
                      <AlertDescription className="text-muted-foreground">
                        No specific recommendations at this time. Your
                        robots.txt seems well-configured for the checked AI
                        crawlers or no analysis was performed.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {!isLoading && !apiError && !analysisResult && (
            <Card className="flex-1 border-dotted border-2 border-border flex flex-col">
              <CardContent className="pt-6 flex-1 flex items-center justify-center flex-col">
                <div className="bg-neutral-800 p-3 rounded-full mb-4 flex items-center justify-center">
                  <InfoIcon className="h-10 w-10 text-neutral-600" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  No Results Yet
                </h2>
                <p className="text-center text-muted-foreground">
                  Enter a URL above and click Analyze to see the results.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
